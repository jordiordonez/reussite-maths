// Capture outils/og_image.html en og-image.png (1200 × 630), à la racine du site.
// Relancer après modification du gabarit : node outils/og_image.cjs
// PLAYWRIGHT_MODULE et CHROMIUM_PATH permettent d'indiquer une installation locale.
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
    await page.goto(pathToFileURL(path.join(__dirname, 'og_image.html')).href);
    const out = path.join(__dirname, '..', 'og-image.png');
    await page.screenshot({path: out, clip: {x: 0, y: 0, width: 1200, height: 630}});
    console.log('Écrit : ' + out);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
