const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get the position of the contact section
  const contactPos = await page.evaluate(() => {
    const contact = document.querySelector('#contact');
    return contact ? contact.offsetTop : 0;
  });
  
  // Scroll to contact section
  await page.evaluate((offset) => {
    window.scrollTo(0, offset);
  }, contactPos);
  
  await new Promise(r => setTimeout(r, 500));
  
  // Take screenshot
  await page.screenshot({ path: './temporary screenshots/screenshot-32-contact-proper.png' });
  
  await browser.close();
  console.log('Saved contact section screenshot');
})();
