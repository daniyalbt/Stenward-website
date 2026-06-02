const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get all sections and their order
  const sectionOrder = await page.evaluate(() => {
    const sections = [
      { id: 'offer', el: document.querySelector('#offer') },
      { id: 'track-record', el: document.querySelector('#track-record') },
      { id: 'services', el: document.querySelector('#services') },
      { id: 'outcomes', el: document.querySelector('#outcomes') },
      { id: 'process', el: document.querySelector('#process') },
      { id: 'contact', el: document.querySelector('#contact') }
    ];
    
    return sections
      .filter(s => s.el)
      .map(s => ({
        id: s.id,
        top: s.el.offsetTop,
        heading: s.el.querySelector('h1, h2, span.eyebrow') ? 
                 s.el.querySelector('h1, h2, span.eyebrow').textContent.trim() : 'no heading'
      }))
      .sort((a, b) => a.top - b.top);
  });
  
  console.log('=== SECTION ORDER ===\n');
  sectionOrder.forEach((section, i) => {
    console.log(`${i + 1}. #${section.id}`);
    console.log(`   Heading: ${section.heading}`);
    console.log(`   Position: ${section.top}px\n`);
  });
  
  await browser.close();
})();
