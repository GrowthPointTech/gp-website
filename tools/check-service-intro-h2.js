const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/services.html?bust=' + Date.now(), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => { const el = document.querySelector('.service-intro'); if (el) el.scrollIntoView(); });
  await new Promise(r => setTimeout(r, 300));
  const info = await page.evaluate(() => {
    const h2 = document.querySelector('.service-intro h2');
    if (!h2) return { found: false };
    const cs = getComputedStyle(h2);
    const lineHeight = parseFloat(cs.lineHeight);
    const height = h2.getBoundingClientRect().height;
    return {
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      height: height,
      estimatedLines: Math.round(height / lineHeight),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'reference/service-intro-h2-mobile.png' });
  await browser.close();
  console.log('Done');
})();
