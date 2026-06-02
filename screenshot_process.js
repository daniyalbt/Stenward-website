const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to process section
  await page.evaluate(() => {
    document.querySelector('#process').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-51-process-text-flow.png' });
  
  // Also take a screenshot with scrolled navbar
  await page.evaluate(() => {
    window.scrollBy(0, 300);
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-52-navbar-scrolled.png' });
  
  await browser.close();
  console.log('Screenshots saved');
})();
