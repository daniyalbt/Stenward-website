const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to contact section
  await page.evaluate(() => {
    document.querySelector('#contact').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  // Click the booking button
  await page.click('#booking-btn-card');
  
  await new Promise(r => setTimeout(r, 300));
  
  // Take screenshot
  await page.screenshot({ path: './temporary screenshots/screenshot-25-modal-open.png' });
  
  await browser.close();
  console.log('Saved screenshot of open modal');
})();
