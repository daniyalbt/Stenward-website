const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Screenshot 1: Normal state
  await page.screenshot({ path: './temporary screenshots/screenshot-58-nav-normal.png' });
  
  // Screenshot 2: Scrolled state
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  const navBrandText = await page.evaluate(() => {
    const span = document.querySelector('.nav-brand span');
    return {
      visible: span && window.getComputedStyle(span).display !== 'none',
      display: span ? window.getComputedStyle(span).display : 'N/A'
    };
  });
  
  console.log('Nav brand text when scrolled:', navBrandText);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-59-nav-scrolled.png' });
  
  // Screenshot 3: Frameworks section with ISO 42001
  await page.goto('http://localhost:3000#track-record', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: './temporary screenshots/screenshot-60-frameworks.png' });
  
  console.log('✓ Screenshots taken');
  
  await browser.close();
})();
