const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get info about the contact section
  const contactInfo = await page.evaluate(() => {
    const contact = document.querySelector('#contact');
    if (!contact) {
      return { exists: false };
    }
    
    const rect = contact.getBoundingClientRect();
    const style = window.getComputedStyle(contact);
    
    return {
      exists: true,
      classes: contact.className,
      background: style.backgroundColor,
      display: style.display,
      height: style.height,
      padding: style.padding,
      offsetHeight: contact.offsetHeight,
      offsetTop: contact.offsetTop,
      scrollTop: document.documentElement.scrollTop,
      innerHeight: window.innerHeight
    };
  });
  
  console.log('Contact section info:', JSON.stringify(contactInfo, null, 2));
  
  // Also check footer
  const footerInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) {
      return { exists: false };
    }
    
    const style = window.getComputedStyle(footer);
    return {
      exists: true,
      background: style.backgroundColor,
      display: style.display,
      offsetHeight: footer.offsetHeight
    };
  });
  
  console.log('Footer info:', JSON.stringify(footerInfo, null, 2));
  
  await browser.close();
})();
