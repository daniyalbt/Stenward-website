const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1400 });
  
  // ISMS Maintenance - tier cards
  await page.goto('http://localhost:3000/service-isms-maintenance.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: './temporary screenshots/screenshot-63-isms-tiers.png' });
  
  // Gap Analysis - bridge to cert
  await page.goto('http://localhost:3000/service-gap-analysis.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    document.querySelector('h2').scrollIntoView();
  });
  await page.screenshot({ path: './temporary screenshots/screenshot-64-gap-bridge.png' });
  
  // Security Questionnaire - approach cards
  await page.goto('http://localhost:3000/service-questionnaire-response.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: './temporary screenshots/screenshot-65-questionnaire-cards.png' });
  
  console.log('✓ Service page screenshots taken');
  
  await browser.close();
})();
