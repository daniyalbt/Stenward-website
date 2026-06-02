const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Test each nav link
  const links = ['offer', 'track-record', 'work', 'services', 'process', 'contact'];
  
  for (const link of links) {
    const exists = await page.evaluate((linkId) => {
      return !!document.querySelector(`#${linkId}`);
    }, link);
    
    console.log(`✓ Section #${link} exists:`, exists);
  }
  
  // Test email changes
  const emailCount = await page.evaluate(() => {
    return {
      infoEmail: document.body.innerHTML.match(/info@stenward\.com/g)?.length || 0,
      helloEmail: document.body.innerHTML.match(/hello@stenward\.com/g)?.length || 0
    };
  });
  
  console.log('Emails found:');
  console.log('  info@stenward.com:', emailCount.infoEmail);
  console.log('  hello@stenward.com:', emailCount.helloEmail);
  
  await browser.close();
})();
