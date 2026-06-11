const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3000/services.html?bust=' + Date.now(), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const rect = await p.evaluate(() => {
    const el = document.querySelector('.service-intro h2');
    const r = el ? el.getBoundingClientRect() : null;
    return r ? { top: r.top + window.scrollY, left: r.left, width: r.width, height: r.height } : null;
  });
  console.log('h2 rect:', JSON.stringify(rect));
  await p.screenshot({ path: 'reference/service-intro-mobile.png', fullPage: true });
  await b.close();
  console.log('Done');
})();
