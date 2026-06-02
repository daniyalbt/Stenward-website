import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'temporary screenshots');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

// Auto-increment: find next N
const existing = existsSync(outDir)
  ? readdirSync(outDir).filter(f => f.endsWith('.png')).length
  : 0;
const n = existing + 1;
const outFile = join(outDir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 600));

const full = process.argv[4] === 'full';

if (full) {
  // Force all scroll-reveal elements visible
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .reveal-fade').forEach(el => el.classList.add('visible'));
  });
  await new Promise(r => setTimeout(r, 500));
}

await page.screenshot({ path: outFile, fullPage: full });
await browser.close();

console.log('Saved:', outFile);
