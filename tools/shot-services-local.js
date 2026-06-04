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
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Force all animations visible, then scroll to services
  const scrollY = await page.evaluate(() => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const el = document.querySelector('.services-overview');
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top);
    return top;
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'reference/services-local-viewport.png' });
  console.log('Scrolled to y=' + scrollY + ', screenshot saved');

  await browser.close();
  srv.close();
}
main().catch(console.error);
