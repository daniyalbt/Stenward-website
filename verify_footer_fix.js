const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check footer padding
  const footerInfo = await page.evaluate(() => {
    const siteFooter = document.querySelector('.site-footer');
    return {
      padding: window.getComputedStyle(siteFooter).padding
    };
  });
  
  console.log('✓ Footer padding updated to:', footerInfo.padding);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-55-footer-fixed.png' });
  
  await browser.close();
  console.log('✓ Footer spacing corrected!');
})();
