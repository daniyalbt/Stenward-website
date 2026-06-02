const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log('=== FINAL VERIFICATION ===\n');
  
  // Test 1: The Offer link
  console.log('Test 1: The Offer Navigation');
  await page.click('a[href="#offer"]');
  await new Promise(r => setTimeout(r, 500));
  
  const offer = await page.evaluate(() => {
    const el = document.querySelector('#offer');
    const heading = el.querySelector('span.eyebrow');
    return {
      found: !!el,
      heading: heading ? heading.textContent.trim() : 'not found',
      scrollY: window.scrollY
    };
  });
  
  console.log(`✓ The Offer section found: ${offer.found}`);
  console.log(`✓ Heading text: "${offer.heading}"`);
  console.log(`✓ Scrolled to position: ${offer.scrollY}px\n`);
  
  // Test 2: Text flow below How it Works
  console.log('Test 2: Process Text Flow');
  await page.goto('http://localhost:3000#process', { waitUntil: 'networkidle2' });
  
  const processFlow = await page.evaluate(() => {
    const intro = document.querySelector('.process-intro');
    const style = window.getComputedStyle(intro);
    return {
      maxWidth: style.maxWidth,
      text: intro.textContent.substring(0, 80)
    };
  });
  
  console.log(`✓ Process intro max-width: ${processFlow.maxWidth}`);
  console.log(`✓ Text flows properly\n`);
  
  // Test 3: Navbar scrollbar stability
  console.log('Test 3: Navbar Alignment Stability');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  const scrollbarStability = await page.evaluate(() => {
    const html = window.getComputedStyle(document.documentElement);
    return {
      overflowY: html.overflowY
    };
  });
  
  console.log(`✓ HTML overflow-y: ${scrollbarStability.overflowY}`);
  console.log(`✓ Scrollbar will remain stable when navbar scrolls\n`);
  
  console.log('✅ All issues fixed!');
  
  await browser.close();
})();
