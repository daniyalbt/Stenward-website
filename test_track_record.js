const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Try to navigate to track record
  await page.goto('http://localhost:3000#track-record', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check if track-record element exists and is visible
  const trackRecordInfo = await page.evaluate(() => {
    const el = document.querySelector('#track-record');
    if (!el) return { exists: false };
    
    const rect = el.getBoundingClientRect();
    const heading = el.querySelector('h2');
    
    return {
      exists: true,
      offsetTop: el.offsetTop,
      scrollY: window.scrollY,
      heading: heading ? heading.textContent : 'no heading'
    };
  });
  
  console.log('Track Record section:', trackRecordInfo);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-43-track-record.png' });
  
  await browser.close();
  console.log('Screenshot saved');
})();
