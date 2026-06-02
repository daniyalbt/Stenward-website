const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await page.goto('http://localhost:3000#process', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Get the process intro text
  const processText = await page.evaluate(() => {
    const intro = document.querySelector('.process-intro');
    return intro ? intro.textContent : 'not found';
  });
  
  console.log('Process intro text:', processText.substring(0, 100) + '...');
  
  await page.screenshot({ path: './temporary screenshots/screenshot-53-how-it-works.png' });
  
  await browser.close();
})();
