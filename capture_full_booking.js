const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Navigate to booking
  await page.evaluate(() => {
    document.querySelector('#contact').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 300));
  await page.click('#booking-btn-card');
  await new Promise(r => setTimeout(r, 300));
  
  // Select date and time
  const dateCell = await page.$('.cal-day:not(.disabled):not(.other-month)');
  if (dateCell) {
    await dateCell.click();
    await new Promise(r => setTimeout(r, 300));
  }
  
  const timeSlot = await page.$('.time-slot:not(.unavailable)');
  if (timeSlot) {
    await timeSlot.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Take screenshot of full booking page
  await page.screenshot({ path: './temporary screenshots/screenshot-39-full-booking-page.png' });
  
  await browser.close();
  console.log('Saved full booking page screenshot');
})();
