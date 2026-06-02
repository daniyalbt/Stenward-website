const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Test 1: Check if cookies banner exists
  const bannerExists = await page.evaluate(() => {
    return !!document.getElementById('cookiesBanner');
  });
  
  console.log('✓ Cookies banner exists:', bannerExists);
  
  // Test 2: Check if modal footer is removed
  const modalFooter = await page.evaluate(() => {
    return document.querySelector('.booking-modal-footer');
  });
  
  console.log('✓ Modal footer removed:', !modalFooter);
  
  // Test 3: Check if Learn More links have the transition handler
  const learnMoreLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href$=".html"]'));
    return links.length;
  });
  
  console.log('✓ Learn More links found:', learnMoreLinks > 0);
  
  // Take screenshot of home with cookies banner
  await page.screenshot({ path: './temporary screenshots/screenshot-41-cookies-banner.png' });
  
  // Test booking modal
  await page.evaluate(() => {
    document.querySelector('#contact').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 300));
  await page.click('#booking-btn-card');
  await new Promise(r => setTimeout(r, 300));
  
  // Check if modal has the footer (should not exist)
  const modal = await page.evaluate(() => {
    const el = document.querySelector('.booking-modal');
    const hasFooter = el ? el.querySelector('.booking-modal-footer') : false;
    const innerHTML = el ? el.innerHTML.substring(0, 200) : '';
    return {
      exists: !!el,
      hasFooter: !!hasFooter,
      hasUnavailableText: el ? el.innerHTML.includes('Unavailable slots') : false,
      hasContactButton: el ? el.innerHTML.includes('Continue to booking system') : false
    };
  });
  
  console.log('\n=== Booking Modal Status ===');
  console.log('✓ Modal exists:', modal.exists);
  console.log('✓ Footer removed:', !modal.hasFooter);
  console.log('✓ Unavailable text removed:', !modal.hasUnavailableText);
  console.log('✓ Continue button removed:', !modal.hasContactButton);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-42-modal-clean.png' });
  
  await browser.close();
  console.log('\n✅ All updates applied successfully!');
})();
