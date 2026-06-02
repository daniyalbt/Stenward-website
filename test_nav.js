const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Test each nav link
  const navLinks = [
    { name: 'Offer', selector: 'a[href="#offer"]' },
    { name: 'Track Record', selector: 'a[href="#track-record"]' },
    { name: 'Work', selector: 'a[href="#work"]' },
    { name: 'Our Services', selector: 'a[href="#services"]' },
    { name: 'Process', selector: 'a[href="#process"]' },
    { name: 'Contact', selector: 'a[href="#contact"]' }
  ];
  
  for (const link of navLinks) {
    const exists = await page.$(link.selector);
    if (exists) {
      console.log(`✓ ${link.name} link exists`);
      
      // Click and verify scroll
      await page.click(link.selector);
      await new Promise(r => setTimeout(r, 500));
      
      const currentSection = await page.evaluate(() => {
        const sections = ['offer', 'services', 'track-record', 'work', 'process', 'contact'];
        const scrollPos = window.scrollY + window.innerHeight / 2;
        
        for (const id of sections) {
          const el = document.querySelector(`#${id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const elTop = rect.top + window.scrollY;
            const elBottom = elTop + rect.height;
            if (scrollPos >= elTop && scrollPos <= elBottom) {
              return id;
            }
          }
        }
        return 'unknown';
      });
      
      console.log(`  → Scrolled to: #${currentSection}`);
    }
  }
  
  // Take final screenshot
  await page.screenshot({ path: './temporary screenshots/screenshot-40-nav-test.png' });
  
  await browser.close();
  console.log('\n✅ Navigation test complete');
})();
