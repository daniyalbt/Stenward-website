const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1400 });
  await page.goto('http://localhost:3000#track-record', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check if ISO 42001 is present
  const iso42001 = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.framework-item')).map(el => el.textContent.trim());
    return {
      frameworksFound: items,
      hasISO42001: items.some(item => item.includes('ISO 42001'))
    };
  });
  
  console.log('Frameworks found:', iso42001);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-61-iso42001-detail.png' });
  
  await browser.close();
})();
