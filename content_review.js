const fs = require('fs');
const path = require('path');

// Read all HTML files and extract text content
const htmlFiles = [
  'index.html',
  'privacy.html',
  'booking-confirmation.html',
  'service-iso-27001-implementation.html',
  'service-gap-analysis.html',
  'service-isms-maintenance.html',
  'service-internal-audit.html',
  'service-questionnaire-response.html',
  'service-awareness-training.html'
];

const textContent = {};

htmlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    // Extract text between > and <, remove scripts/styles
    let text = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    textContent[file] = text;
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
});

// Output a sample of each file for review
console.log('=== CONTENT REVIEW ===\n');
Object.entries(textContent).forEach(([file, text]) => {
  console.log(`\n📄 ${file}:`);
  console.log(`Length: ${text.length} characters`);
  const excerpt = text.substring(0, 500) + '...';
  console.log(`Preview: ${excerpt}\n`);
});
