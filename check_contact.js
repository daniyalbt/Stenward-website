const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to contact section
  await page.evaluate(() => {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView();
    }
  });
  
  // Wait using a promise
  await new Promise(r => setTimeout(r, 500));
  
  // Take screenshot
  await page.screenshot({ path: './temporary screenshots/screenshot-23-contact.png', fullPage: false });
  
  await browser.close();
  console.log('Saved: ./temporary screenshots/screenshot-23-contact.png');
})();
