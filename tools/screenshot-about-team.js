const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3000/about.html?bust=' + Date.now(), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const info = await p.evaluate(() => {
    const card = document.querySelector('.about-team__card');
    const photo = document.querySelector('.about-team__photo');
    const body = document.querySelector('.about-team__card-body');
    if (!card) return { found: false };
    const cs = getComputedStyle(card);
    return {
      cardDisplay: cs.display,
      cardFlexDirection: cs.flexDirection,
      cardAlignItems: cs.alignItems,
      photoRect: photo ? photo.getBoundingClientRect() : null,
      bodyRect: body ? body.getBoundingClientRect() : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await p.evaluate(() => document.querySelector('.about-team').scrollIntoView());
  await new Promise(r => setTimeout(r, 300));
  await p.screenshot({ path: 'reference/about-team-mobile.png', fullPage: true });
  await b.close();
  console.log('Done');
})();
