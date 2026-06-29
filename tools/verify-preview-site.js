const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('https://preview.gptechadvisors.com/about.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Draw center line + measure elements
  const data = await page.evaluate(() => {
    const get = el => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { textAlign: cs.textAlign, left: Math.round(r.left), right: Math.round(r.right), text: el.textContent.trim().slice(0, 40) };
    };
    // draw center line
    const line = document.createElement('div');
    line.style.cssText = 'position:fixed;left:719px;top:0;width:2px;height:100vh;background:red;z-index:9999;opacity:0.8;pointer-events:none;';
    document.body.appendChild(line);
    return {
      eyebrow: get(document.querySelector('.hero--about__eyebrow')),
      h1: get(document.querySelector('.hero--about h1')),
      heroDesc: get(document.querySelector('.hero--about p:not(.hero--about__eyebrow)')),
      missionH2: get(document.querySelector('.about-mission h2')),
      missionP: get(document.querySelector('.about-mission p')),
    };
  });

  console.log(JSON.stringify(data, null, 2));

  const hero = await page.$('.hero--about');
  const heroBox = await hero.boundingBox();
  await page.screenshot({ path: 'reference/preview-about-hero.png', clip: { x: 0, y: heroBox.y, width: 1440, height: heroBox.height } });

  const mission = await page.$('.about-mission');
  const missionBox = await mission.boundingBox();
  await page.screenshot({ path: 'reference/preview-about-mission.png', clip: { x: 0, y: missionBox.y, width: 1440, height: missionBox.height } });

  await browser.close();
  console.log('Done');
})();
