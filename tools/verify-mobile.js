const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // iPhone 14 dimensions
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:3000/about.html?bust=${Date.now()}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const styles = await page.evaluate(() => {
    const get = el => el ? { textAlign: getComputedStyle(el).textAlign, text: el.textContent.trim().slice(0, 40) } : null;
    return {
      eyebrow:  get(document.querySelector('.hero--about__eyebrow')),
      h1:       get(document.querySelector('.hero--about h1')),
      heroDesc: get(document.querySelector('.hero--about p:not(.hero--about__eyebrow)')),
    };
  });
  console.log(JSON.stringify(styles, null, 2));

  const hero = await page.$('.hero--about');
  const box = await hero.boundingBox();
  await page.screenshot({ path: 'reference/about-mobile-hero.png', clip: { x: 0, y: box.y, width: 390, height: box.height } });

  await browser.close();
  console.log('Done');
})();
