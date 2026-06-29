const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startServer(port) {
  return new Promise(resolve => {
    const root = path.join(__dirname, '..');
    const s = http.createServer((req, res) => {
      const fp = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      const t = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
      res.writeHead(200, {'Content-Type': t[path.extname(fp)] || 'text/plain'});
      fs.createReadStream(fp).pipe(res);
    });
    s.listen(port, () => resolve(s));
  });
}

async function shoot(browser, url, outFile) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  // Capture just the top 400px (nav + hero text area)
  await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 1280, height: 400 } });
  const pos = await page.evaluate(() => {
    const logo = document.querySelector('.nav__logo, .elementor-nav-menu');
    const eyebrow = document.querySelector('.hero--home .hero__eyebrow') || document.querySelector('h1');
    const h1 = document.querySelector('h1');
    return {
      logoLeft:    logo    ? Math.round(logo.getBoundingClientRect().left)    : null,
      eyebrowLeft: eyebrow ? Math.round(eyebrow.getBoundingClientRect().left) : null,
      h1Left:      h1      ? Math.round(h1.getBoundingClientRect().left)      : null,
    };
  });
  await page.close();
  return pos;
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  const live  = await shoot(browser, 'https://www.gptechadvisors.com',  'reference/hero-zoom-live.png');
  const local = await shoot(browser, 'http://localhost:8765',            'reference/hero-zoom-local.png');

  await browser.close();
  srv.close();

  console.log('LIVE  — logo left:', live.logoLeft,  '| eyebrow left:', live.eyebrowLeft,  '| h1 left:', live.h1Left);
  console.log('LOCAL — logo left:', local.logoLeft, '| eyebrow left:', local.eyebrowLeft, '| h1 left:', local.h1Left);
  console.log('Eyebrow diff:', (local.eyebrowLeft - live.eyebrowLeft) + 'px  (+ = too right, - = too left)');
  console.log('H1 diff:',     (local.h1Left      - live.h1Left)      + 'px');
}
main().catch(console.error);
