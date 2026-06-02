const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Screenshot 1: Click The Offer link
  await page.click('a[href="#offer"]');
  await new Promise(r => setTimeout(r, 500));
  
  const scrollY1 = await page.evaluate(() => window.scrollY);
  console.log('After clicking "The Offer", scrollY:', scrollY1);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-45-offer-link.png' });
  
  // Screenshot 2: How it Works section
  await page.evaluate(() => {
    document.querySelector('#process').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-46-how-it-works.png' });
  
  // Screenshot 3: Scroll down to see navbar shrink
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-47-navbar-shrink.png' });
  
  await browser.close();
  console.log('Screenshots saved');
})();
