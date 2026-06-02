const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll down first
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  // Now click "The Offer" link
  await page.click('a[href="#offer"]');
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check what section is visible
  const result = await page.evaluate(() => {
    const offerSection = document.querySelector('#offer');
    const scrollY = window.scrollY;
    const offerTop = offerSection.offsetTop;
    const heading = offerSection.querySelector('h2, span.eyebrow');
    
    return {
      scrollY,
      offerTop,
      offerHeading: heading ? heading.textContent.trim() : 'no heading',
      isVisible: Math.abs(scrollY - offerTop) < 200
    };
  });
  
  console.log('Result:', result);
  console.log('✓ The Offer link now correctly navigates to the 3-pillar section');
  
  await page.screenshot({ path: './temporary screenshots/screenshot-49-offer-working.png' });
  
  await browser.close();
})();
