#!/usr/bin/env node
/**
 * Compare mobile nav overlay — live site vs local site.
 * Opens both at 390px wide (iPhone), clicks the hamburger,
 * screenshots the open overlay, saves to reference/.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE_URL  = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8766;
const LOCAL_ROOT = path.join(__dirname, '..');

function startServer() {
  return new Promise(resolve => {
    const mime = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
      '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
      '.webp':'image/webp', '.woff2':'font/woff2' };
    const server = http.createServer((req, res) => {
      const fp = path.join(LOCAL_ROOT, req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(fp);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); }
        else { res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' }); res.end(data); }
      });
    });
    server.listen(LOCAL_PORT, () => { console.log(`Local: http://localhost:${LOCAL_PORT}`); resolve(server); });
  });
}

async function screenshotNav(page, url, label) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click hamburger
  const toggle = await page.$('.nav__toggle');
  if (toggle) {
    await toggle.click();
    await new Promise(r => setTimeout(r, 600));
  }

  const out = path.join(__dirname, '..', 'reference', `mobile-nav-${label}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`Saved: ${out}`);
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2,
                   isMobile: true, hasTouch: true };

  const livePage = await browser.newPage();
  await livePage.setViewport(MOBILE);
  await screenshotNav(livePage, LIVE_URL + '/', 'live');

  const localPage = await browser.newPage();
  await localPage.setViewport(MOBILE);
  await screenshotNav(localPage, `http://localhost:${LOCAL_PORT}/`, 'local');

  await browser.close();
  server.close();
  console.log('\nDone — check reference/mobile-nav-live.png vs reference/mobile-nav-local.png');
}

main().catch(e => { console.error(e); process.exit(1); });
