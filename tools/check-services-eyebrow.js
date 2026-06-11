const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/services.html?bust=' + Date.now(), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const info = await page.evaluate(() => {
    const el = document.querySelector('.hero--services .hero__eyebrow');
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      found: true,
      text: el.textContent.trim(),
      fontSize: cs.fontSize,
      letterSpacing: cs.letterSpacing,
      rectWidth: rect.width,
      rectLeft: rect.left,
      overflowing: rect.width > window.innerWidth,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'reference/services-eyebrow-mobile.png' });
  await browser.close();
  console.log('Done');
})();
