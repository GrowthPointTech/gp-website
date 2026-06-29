const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3000/about.html?bust=' + Date.now(), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const info = await p.evaluate(() => {
    const card   = document.querySelector('.about-team__card');
    const name   = document.querySelector('.about-team__name');
    const title  = document.querySelector('.about-team__title');
    const btn    = document.querySelector('.about-team__toggle-btn');
    const cardTop = card ? card.getBoundingClientRect().top + window.scrollY : 0;
    const rel = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY - cardTop, bottom: r.bottom + window.scrollY - cardTop, right: r.right, left: r.left, width: r.width, height: r.height };
    };
    return { card: rel(card), name: rel(name), title: rel(title), btn: rel(btn) };
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})();
