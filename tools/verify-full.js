const puppeteer = require('puppeteer');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function shoot(page, selector, outPath) {
  const el = await page.$(selector);
  if (!el) { console.log('NOT FOUND:', selector); return; }
  const box = await el.boundingBox();
  await page.screenshot({ path: outPath, clip: { x: 0, y: box.y, width: box.width + box.x, height: box.height } });
}

async function getStyles(page) {
  return page.evaluate(() => {
    const get = el => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        class: el.className,
        text: el.textContent.trim().slice(0, 50),
        textAlign: cs.textAlign,
        marginLeft: cs.marginLeft,
        marginRight: cs.marginRight,
        maxWidth: cs.maxWidth,
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      };
    };
    return {
      eyebrow:        get(document.querySelector('.hero--about__eyebrow')),
      h1:             get(document.querySelector('.hero--about h1')),
      heroDesc:       get(document.querySelector('.hero--about p:not(.hero--about__eyebrow)')),
      missionH2:      get(document.querySelector('.about-mission h2')),
      missionP:       get(document.querySelector('.about-mission p')),
      heroContainer:  get(document.querySelector('.hero--about .container')),
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox']
  });

  for (const width of [1280, 1440, 1920]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    // Bypass cache by adding a cache-busting query string
    await page.goto(`http://localhost:3000/about.html?v=${Date.now()}`, { waitUntil: 'networkidle0' });
    // Wait for animations to complete
    await new Promise(r => setTimeout(r, 1500));

    const styles = await getStyles(page);
    console.log(`\n=== ${width}px ===`);
    console.log(JSON.stringify(styles, null, 2));

    await shoot(page, '.hero--about', `reference/about-hero-${width}.png`);
    await shoot(page, '.about-mission', `reference/about-mission-${width}.png`);
    await page.close();
  }

  // Services hero for comparison at 1440
  const svcPage = await browser.newPage();
  await svcPage.setViewport({ width: 1440, height: 900 });
  await svcPage.goto(`http://localhost:3000/services.html?v=${Date.now()}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await shoot(svcPage, '.hero--services', 'reference/services-hero-1440-compare.png');
  await svcPage.close();

  await browser.close();
  console.log('\nDone.');
})();
