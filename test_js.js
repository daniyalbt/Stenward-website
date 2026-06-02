const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('error', err => console.log('PAGE ERROR:', err));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Check if booking buttons exist
  const btnMain = await page.$('#booking-btn-main');
  const btnCard = await page.$('#booking-btn-card');
  const modal = await page.$('#booking-modal');
  
  console.log('Button main exists:', !!btnMain);
  console.log('Button card exists:', !!btnCard);
  console.log('Modal exists:', !!modal);
  
  // Try clicking the button
  if (btnCard) {
    console.log('Clicking button card...');
    await btnCard.click();
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 500));
    
    // Check if modal is visible
    const modalDisplay = await page.$eval('#booking-modal', el => window.getComputedStyle(el).display);
    console.log('Modal display after click:', modalDisplay);
  }
  
  await browser.close();
})();
