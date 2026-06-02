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
  
  // Take screenshot of modal
  await page.screenshot({ path: './temporary screenshots/screenshot-34-booking-modal.png' });
  
  // Click on a date
  const dateCell = await page.$('.cal-day:not(.disabled):not(.other-month)');
  if (dateCell) {
    await dateCell.click();
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Take screenshot of time slots
  await page.screenshot({ path: './temporary screenshots/screenshot-35-time-slots.png' });
  
  // Click a time slot
  const timeSlot = await page.$('.time-slot:not(.unavailable)');
  if (timeSlot) {
    // Listen for navigation
    page.once('navigation', () => console.log('Page navigated'));
    
    await timeSlot.click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot of confirmation page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('booking-confirmation')) {
      await page.screenshot({ path: './temporary screenshots/screenshot-36-booking-confirmation.png' });
      console.log('✅ Booking confirmation page loaded');
    }
  }
  
  await browser.close();
})();
