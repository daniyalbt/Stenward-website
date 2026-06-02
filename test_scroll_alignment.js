const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to process section
  await page.evaluate(() => {
    document.querySelector('#process').scrollIntoView();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check navbar state and eyebrow alignment
  const state = await page.evaluate(() => {
    const nav = document.querySelector('.nav-inner');
    const scrolled = nav.classList.contains('scrolled');
    const eyebrow = document.querySelector('#process .eyebrow');
    
    return {
      navScrolled: scrolled,
      eyebrowText: eyebrow ? eyebrow.textContent : 'not found'
    };
  });
  
  console.log('State:', state);
  
  await page.screenshot({ path: './temporary screenshots/screenshot-48-scroll-check.png' });
  
  await browser.close();
})();
