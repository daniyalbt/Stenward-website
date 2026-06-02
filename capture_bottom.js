const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to show contact and footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight - 1400);
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-31-bottom.png' });
  
  await browser.close();
  console.log('Saved bottom section screenshot');
})();
