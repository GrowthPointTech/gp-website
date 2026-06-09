const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8767;
const LOCAL_ROOT = '/Users/msstrader/Documents/gp-website';

function startServer() {
  return new Promise(resolve => {
    const mime = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2' };
    const s = http.createServer((req, res) => {
      const fp = path.join(LOCAL_ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end(); }
        else { res.writeHead(200, {'Content-Type': mime[path.extname(fp)] || 'text/plain'}); res.end(data); }
      });
    });
    s.listen(LOCAL_PORT, () => resolve(s));
  });
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

  for (const [label, url] of [['live', LIVE_URL + '/services/'], ['local', 'http://localhost:' + LOCAL_PORT + '/services.html']]) {
    const page = await browser.newPage();
    await page.setViewport(MOBILE);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `/tmp/services-mobile-${label}.png`, fullPage: false });
    console.log(`Saved: services-mobile-${label}.png`);
    await page.close();
  }

  await browser.close();
  server.close();
}

main().catch(e => { console.error(e); process.exit(1); });
