const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Test navigation
  const navLinks = [
    { label: 'The Offer', href: '#offer', expectedId: 'offer' },
    { label: 'Track Record', href: '#track-record', expectedId: 'track-record' },
    { label: 'Our Services', href: '#services', expectedId: 'services' },
    { label: 'Client Outcomes', href: '#outcomes', expectedId: 'outcomes' },
    { label: 'Process', href: '#process', expectedId: 'process' },
    { label: 'Contact', href: '#contact', expectedId: 'contact' }
  ];
  
  console.log('=== NAVIGATION VERIFICATION ===\n');
  
  for (const link of navLinks) {
    // Click the nav link
    await page.click(`a[href="${link.href}"]`);
    await new Promise(r => setTimeout(r, 500));
    
    // Check which section is in view
    const visibleSection = await page.evaluate(() => {
      const sections = ['offer', 'track-record', 'services', 'outcomes', 'process', 'contact'];
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
    
    const match = visibleSection === link.expectedId;
    console.log(`${match ? '✓' : '✗'} "${link.label}" ${match ? 'navigates to' : 'does NOT navigate to'} #${link.expectedId}`);
    if (!match) {
      console.log(`  Actually navigated to: #${visibleSection}`);
    }
  }
  
  // Check nav text
  const navText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.nav-links a')).map(a => a.textContent.trim());
  });
  
  console.log('\n=== NAVIGATION TEXT ===');
  console.log('Links shown:', navText.join(' → '));
  
  await browser.close();
  console.log('\n✅ Test complete!');
})();
