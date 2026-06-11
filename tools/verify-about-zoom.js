const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/about.html', { waitUntil: 'networkidle0' });

  // Detailed box model info
  const info = await page.evaluate(() => {
    const getInfo = el => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        text: el.textContent.trim().slice(0, 60),
        textAlign: cs.textAlign,
        display: cs.display,
        width: cs.width,
        maxWidth: cs.maxWidth,
        marginLeft: cs.marginLeft,
        marginRight: cs.marginRight,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        rectWidth: Math.round(rect.width),
      };
    };

    return {
      heroSection: getInfo(document.querySelector('.hero--about')),
      container: getInfo(document.querySelector('.hero--about .container')),
      eyebrow: getInfo(document.querySelector('.hero--about__eyebrow')),
      h1: getInfo(document.querySelector('.hero--about h1')),
      heroDesc: getInfo(document.querySelector('.hero--about p:not(.hero--about__eyebrow)')),
      missionSection: getInfo(document.querySelector('.about-mission')),
      missionContainer: getInfo(document.querySelector('.about-mission .container')),
      missionH2: getInfo(document.querySelector('.about-mission h2')),
      missionP: getInfo(document.querySelector('.about-mission p')),
    };
  });

  console.log(JSON.stringify(info, null, 2));

  // Hero screenshot
  const heroEl = await page.$('.hero--about');
  const heroBounds = await heroEl.boundingBox();
  await page.screenshot({ path: 'reference/about-hero-zoom.png', clip: { x: 0, y: heroBounds.y, width: 1440, height: heroBounds.height } });

  // Mission screenshot
  const missionEl = await page.$('.about-mission');
  const missionBounds = await missionEl.boundingBox();
  await page.screenshot({ path: 'reference/about-mission-zoom.png', clip: { x: 0, y: missionBounds.y, width: 1440, height: missionBounds.height } });

  await browser.close();
})();
