const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const root = path.join(__dirname, '..');
  const srv = http.createServer((req, res) => {
    const fp = path.join(root, decodeURIComponent(req.url === '/' ? 'index.html' : req.url.split('?')[0]));
    if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
    const t = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
    res.writeHead(200, {'Content-Type': t[path.extname(fp)] || 'text/plain'});
    fs.createReadStream(fp).pipe(res);
  });
  await new Promise(r => srv.listen(8765, r));

  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  // LOCAL
  const localPage = await browser.newPage();
  await localPage.setViewport({ width: 1280, height: 900 });
  await localPage.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await localPage.evaluate(() => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const s = document.createElement('style');
    s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
    document.head.appendChild(s);
    const el = document.querySelector('.blog-highlights');
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 20);
  });
  await new Promise(r => setTimeout(r, 500));
  await localPage.screenshot({ path: 'reference/blog-hl-local-zoom.png' });
  console.log('Local screenshot saved');
  await localPage.close();

  // LIVE
  const livePage = await browser.newPage();
  await livePage.setViewport({ width: 1280, height: 900 });
  await livePage.goto('https://www.gptechadvisors.com', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await livePage.evaluate(() => {
    const el = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts'));
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
  });
  await new Promise(r => setTimeout(r, 500));
  await livePage.screenshot({ path: 'reference/blog-hl-live-zoom.png' });
  console.log('Live screenshot saved');
  await livePage.close();

  await browser.close();
  srv.close();
}
main().catch(console.error);
