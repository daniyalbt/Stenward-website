const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get content from contact section
  const contactContent = await page.evaluate(() => {
    const contact = document.querySelector('#contact');
    if (!contact) return { error: 'Contact section not found' };
    
    return {
      innerHTML: contact.innerHTML.substring(0, 500),
      textContent: contact.textContent.substring(0, 300),
      childNodes: contact.childNodes.length,
      bookingGrid: !!document.querySelector('.booking-grid'),
      bookingBtnMain: !!document.querySelector('#booking-btn-main'),
      bookingBtnCard: !!document.querySelector('#booking-btn-card'),
      modal: !!document.querySelector('#booking-modal'),
      calCard: !!document.querySelector('.cal-card')
    };
  });
  
  console.log('Contact content:', JSON.stringify(contactContent, null, 2));
  
  await browser.close();
})();
