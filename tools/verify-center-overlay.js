const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  for (const width of [1280, 1440]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    await page.goto(`http://localhost:3000/about.html?bust=${Date.now()}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // Draw vertical center line + bounding boxes on each text element
    await page.evaluate((vw) => {
      const mark = (el, color) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const box = document.createElement('div');
        box.style.cssText = `position:fixed;pointer-events:none;z-index:9999;
          left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;
          outline:3px solid ${color};background:${color}22;`;
        document.body.appendChild(box);
        // center dot
        const dot = document.createElement('div');
        dot.style.cssText = `position:fixed;pointer-events:none;z-index:9999;
          left:${r.left + r.width/2 - 3}px;top:${r.top}px;width:6px;height:${r.height}px;
          background:${color};opacity:0.8;`;
        document.body.appendChild(dot);
      };
      // page center line
      const line = document.createElement('div');
      line.style.cssText = `position:fixed;pointer-events:none;z-index:9999;
        left:${vw/2 - 1}px;top:0;width:2px;height:100vh;background:red;opacity:0.7;`;
      document.body.appendChild(line);

      mark(document.querySelector('.hero--about__eyebrow'), '#00ff00');
      mark(document.querySelector('.hero--about h1'), '#00aaff');
      mark(document.querySelector('.hero--about p:not(.hero--about__eyebrow)'), '#ffaa00');
    }, width);

    const hero = await page.$('.hero--about');
    const box = await hero.boundingBox();
    await page.screenshot({ path: `reference/about-overlay-${width}.png`, clip: { x: 0, y: box.y, width, height: box.height } });

    // Also check what CSS file is actually loaded
    const cssCheck = await page.evaluate(() => {
      const sheets = [...document.styleSheets];
      for (const s of sheets) {
        if (s.href && s.href.includes('pages.css')) {
          try {
            const rules = [...s.cssRules];
            for (const r of rules) {
              if (r.selectorText && r.selectorText.includes('hero--about') && r.selectorText.includes('container')) {
                return r.cssText.slice(0, 200);
              }
            }
          } catch(e) { return 'error: ' + e.message; }
        }
      }
      return 'not found';
    });
    console.log(`[${width}px] .hero--about .container rule:`, cssCheck);

    await page.close();
  }

  await browser.close();
})();
