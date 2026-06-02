const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get full page height
  const bodyHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });
  
  console.log(`Page height: ${bodyHeight}px`);
  
  // Set viewport to capture full page
  await page.setViewport({
    width: 1200,
    height: bodyHeight
  });
  
  // Take full page screenshot
  await page.screenshot({ path: './temporary screenshots/screenshot-24-full.png', fullPage: true });
  
  await browser.close();
  console.log('Saved full page screenshot');
})();
