#!/usr/bin/env node
/**
 * Desktop regression check — screenshots all key pages at 1440px wide,
 * both live and local, saves side-by-side for comparison.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE_URL   = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8780;
const LOCAL_ROOT = path.join(__dirname, '..');

const PAGES = [
  { live: '/',          local: '/index.html',       label: 'home' },
  { live: '/services/', local: '/services.html',     label: 'services' },
  { live: '/about/',    local: '/about.html',        label: 'about' },
  { live: '/blog/',     local: '/blog/index.html',   label: 'blog' },
];

function startServer() {
  return new Promise(resolve => {
    const mime = {
      '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
      '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
      '.webp':'image/webp', '.woff2':'font/woff2'
    };
    const s = http.createServer((req, res) => {
      const fp = path.join(LOCAL_ROOT, req.url.split('?')[0]);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); }
        else { res.writeHead(200, {'Content-Type': mime[path.extname(fp)] || 'text/plain'}); res.end(data); }
      });
    });
    s.listen(LOCAL_PORT, () => { console.log(`Local: http://localhost:${LOCAL_PORT}`); resolve(s); });
  });
}

async function shot(page, url, label, suffix) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  const out = path.join(__dirname, '..', 'reference', `desktop-${label}-${suffix}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`  ✓ ${label} ${suffix}`);
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const DESKTOP = { width: 1440, height: 900 };

  for (const p of PAGES) {
    console.log(`\n${p.label}:`);
    const livePage  = await browser.newPage();
    const localPage = await browser.newPage();
    await livePage.setViewport(DESKTOP);
    await localPage.setViewport(DESKTOP);
    await shot(livePage,  LIVE_URL + p.live,                         p.label, 'live');
    await shot(localPage, `http://localhost:${LOCAL_PORT}${p.local}`, p.label, 'local');
    await livePage.close();
    await localPage.close();
  }

  await browser.close();
  server.close();
  console.log('\nAll screenshots saved to reference/desktop-*.png');
}

main().catch(e => { console.error(e); process.exit(1); });
