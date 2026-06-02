const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to bottom with navbar shrunk
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check footer spacing
  const footerInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const nav = document.querySelector('.nav-inner');
    const siteFooter = document.querySelector('.site-footer');
    
    return {
      navScrolled: nav.classList.contains('scrolled'),
      footerPadding: footer ? window.getComputedStyle(footer).padding : 'N/A',
      siteFooterPadding: siteFooter ? window.getComputedStyle(siteFooter).padding : 'N/A',
      scrollY: window.scrollY
    };
  });
  
  console.log('Footer spacing info:', footerInfo);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-54-footer-spacing.png' });
  
  await browser.close();
})();
