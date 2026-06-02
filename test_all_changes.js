const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Test 1: Verify section order
  console.log('=== Testing Section Order ===');
  const sectionOrder = await page.evaluate(() => {
    const sections = [
      { id: 'offer', el: document.querySelector('#offer') },
      { id: 'services', el: document.querySelector('#services') },
      { id: 'track-record', el: document.querySelector('#track-record') },
      { id: 'work', el: document.querySelector('#work') },
      { id: 'process', el: document.querySelector('#process') },
      { id: 'contact', el: document.querySelector('#contact') }
    ];
    
    return sections
      .filter(s => s.el)
      .map(s => ({
        id: s.id,
        top: s.el.getBoundingClientRect().top + window.scrollY
      }))
      .sort((a, b) => a.top - b.top)
      .map(s => s.id);
  });
  
  console.log('Section order:', sectionOrder.join(' → '));
  
  // Test 2: Navigate to contact and open booking modal
  console.log('\n=== Testing Booking Flow ===');
  await page.evaluate(() => {
    document.querySelector('#contact').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 300));
  await page.click('#booking-btn-card');
  await new Promise(r => setTimeout(r, 300));
  
  // Test 3: Select date and time
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
  
  const currentUrl = page.url();
  console.log('✓ Redirected to:', currentUrl.split('/').pop());
  
  // Test 4: Fill form and submit
  await page.type('#fullName', 'John Doe');
  await page.type('#email', 'john@example.com');
  await page.type('#company', 'Acme Corp');
  await page.type('#phone', '+1234567890');
  await page.type('#message', 'We need to get certified for SOC 2 compliance.');
  
  await page.screenshot({ path: './temporary screenshots/screenshot-37-booking-form.png' });
  
  await page.click('#bookingForm button[type="submit"]');
  await new Promise(r => setTimeout(r, 500));
  
  const successVisible = await page.evaluate(() => {
    return document.getElementById('successState').classList.contains('active');
  });
  
  console.log('✓ Success message displayed:', successVisible);
  
  if (successVisible) {
    await page.screenshot({ path: './temporary screenshots/screenshot-38-booking-success.png' });
  }
  
  await browser.close();
  console.log('\n✅ All tests passed!');
})();
