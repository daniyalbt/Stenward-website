const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get the order of sections by their position on the page
  const sectionOrder = await page.evaluate(() => {
    const sections = [
      { id: 'offer', el: document.querySelector('#offer') },
      { id: 'services', el: document.querySelector('#services') },
      { id: 'track-record', el: document.querySelector('#track-record') },
      { id: 'work', el: document.querySelector('#work') },
      { id: 'process', el: document.querySelector('#process') },
      { id: 'contact', el: document.querySelector('#contact') }
    ];
    
    return sections
      .filter(s => s.el)
      .map(s => ({
        id: s.id,
        top: s.el.getBoundingClientRect().top + window.scrollY
      }))
      .sort((a, b) => a.top - b.top)
      .map(s => s.id);
  });
  
  console.log('Section order on page:');
  sectionOrder.forEach((id, i) => {
    console.log(`  ${i + 1}. #${id}`);
  });
  
  // Verify Services is between Offer and Track Record
  const offerIndex = sectionOrder.indexOf('offer');
  const servicesIndex = sectionOrder.indexOf('services');
  const trackRecordIndex = sectionOrder.indexOf('track-record');
  
  const servicesInRightPlace = servicesIndex > offerIndex && servicesIndex < trackRecordIndex;
  console.log('\n✓ Services between Offer and Track Record:', servicesInRightPlace);
  
  await browser.close();
})();
