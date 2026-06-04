/**
 * Screenshot homepage sections for visual comparison.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8765;
const LOCAL_ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startLocalServer(root, port) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let fp = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(fp);
      const types = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webp':'image/webp' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      fs.createReadStream(fp).pipe(res);
    });
    srv.listen(port, () => resolve(srv));
  });
}

async function screenshotSection(page, outputPath, clip) {
  await page.screenshot({ path: outputPath, clip });
}

async function getRect(page, selector) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
  }, selector);
}

async function main() {
  const srv = await startLocalServer(LOCAL_ROOT, LOCAL_PORT);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  for (const [label, url, prefix, useScrollY] of [
    ['live', LIVE_URL, 'live', true],
    ['local', `http://localhost:${LOCAL_PORT}`, 'local', true],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Full page screenshots
    await page.screenshot({ path: `reference/home-full-${prefix}.png`, fullPage: true });
    console.log(`${label}: Full page → reference/home-full-${prefix}.png`);

    // Footer social icons zoom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 500));
    const footerRect = await page.evaluate(() => {
      const el = document.querySelector('.footer, footer');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: 0, y: 0, width: 1280, height: 900 };
    });
    await page.screenshot({ path: `reference/home-footer-${prefix}.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } });
    console.log(`${label}: Footer → reference/home-footer-${prefix}.png`);

    await page.close();
  }

  await browser.close();
  srv.close();
}

main().catch(console.error);
