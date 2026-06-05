const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startServer(port) {
  return new Promise(resolve => {
    const root = path.join(__dirname, '..');
    const s = http.createServer((req, res) => {
      const fp = path.join(root, decodeURIComponent(req.url === '/' ? 'index.html' : req.url.split('?')[0]));
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      const t = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
      res.writeHead(200, {'Content-Type': t[path.extname(fp)] || 'text/plain'});
      fs.createReadStream(fp).pipe(res);
    });
    s.listen(port, () => resolve(s));
  });
}

async function shootServices(browser, url, label, isLive) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Force scroll-animate visible, find section, scroll to it
  const sectionTop = await page.evaluate((live) => {
    if (!live) document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const el = document.querySelector('.services-overview') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'))
        ?.closest('section, .e-con-boxed, [data-element_type="container"]');
    if (!el) return -1;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - 10);
    return top;
  }, isLive);

  if (sectionTop < 0) { console.log(label + ': section not found'); await page.close(); return; }
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: `reference/services-compare-${label}.png` });

  const stats = await page.evaluate((live) => {
    const sel = live
      ? (Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'))?.closest('section, .e-con-boxed') )
      : document.querySelector('.services-overview');
    if (!sel) return null;
    const r = sel.getBoundingClientRect();
    const c = window.getComputedStyle(sel);
    return { h: Math.round(r.height), bg: c.backgroundColor, pt: c.paddingTop, pb: c.paddingBottom };
  }, isLive);

  console.log(label, stats);
  await page.close();
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  console.log('Shooting live...');
  await shootServices(browser, 'https://www.gptechadvisors.com', 'live', true);

  console.log('Shooting local...');
  await shootServices(browser, 'http://localhost:8765', 'local', false);

  await browser.close();
  srv.close();
  console.log('Done. reference/services-compare-live.png & services-compare-local.png');
}
main().catch(console.error);
