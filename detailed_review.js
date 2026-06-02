const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Extract all visible text from the page
  const textContent = await page.evaluate(() => {
    const textNodes = [];
    
    // Get main content sections
    const sections = {
      'Hero': document.querySelector('.hero'),
      'Services': document.querySelector('#services'),
      'Track Record': document.querySelector('#track-record'),
      'Work': document.querySelector('#work'),
      'Process': document.querySelector('#process'),
      'Contact': document.querySelector('#contact')
    };
    
    const result = {};
    
    Object.entries(sections).forEach(([name, el]) => {
      if (el) {
        // Extract h1, h2, h3, p, spans
        const headings = Array.from(el.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim());
        const paragraphs = Array.from(el.querySelectorAll('p')).map(p => p.textContent.trim());
        const buttons = Array.from(el.querySelectorAll('button, a[class*="btn"]')).map(b => b.textContent.trim());
        
        result[name] = {
          headings: headings.slice(0, 3),
          paragraphs: paragraphs.slice(0, 2),
          buttons: buttons.slice(0, 2)
        };
      }
    });
    
    return result;
  });
  
  console.log('=== HOMEPAGE CONTENT REVIEW ===\n');
  
  Object.entries(textContent).forEach(([section, content]) => {
    console.log(`\n📌 ${section} Section:`);
    console.log('Headings:');
    content.headings.forEach(h => console.log(`  • ${h}`));
    console.log('Sample Text:');
    content.paragraphs.forEach(p => console.log(`  • ${p.substring(0, 80)}...`));
  });
  
  // Check service pages
  console.log('\n\n=== SERVICE PAGES REVIEW ===\n');
  
  const servicePages = [
    '/service-iso-27001-implementation.html',
    '/service-gap-analysis.html',
    '/service-isms-maintenance.html',
    '/service-internal-audit.html',
    '/service-questionnaire-response.html',
    '/service-awareness-training.html'
  ];
  
  for (const servicePage of servicePages) {
    await page.goto('http://localhost:3000' + servicePage, { waitUntil: 'networkidle2' });
    
    const title = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const intro = document.querySelector('.service-intro');
      return {
        title: h1 ? h1.textContent.trim() : 'N/A',
        intro: intro ? intro.textContent.trim().substring(0, 100) : 'N/A'
      };
    });
    
    console.log(`\n📄 ${servicePage.replace('/service-', '').replace('.html', '')}`);
    console.log(`  Title: ${title.title}`);
    console.log(`  Intro: ${title.intro}...`);
  }
  
  await browser.close();
})();
