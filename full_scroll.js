const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to the "How it works" section
  await page.evaluate(() => {
    document.querySelector('#approach').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-27-approach.png' });
  
  // Now scroll to contact
  await page.evaluate(() => {
    document.querySelector('#contact').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-28-contact-view.png' });
  
  // Scroll to footer
  await page.evaluate(() => {
    window.scrollBy(0, 800);
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-29-footer.png' });
  
  await browser.close();
  console.log('Saved scrolling screenshots');
})();
