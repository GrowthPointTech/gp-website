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

async function check(browser, url, label, isLive) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const scrollY = await page.evaluate((live) => {
    if (!live) {
      document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
      const s = document.createElement('style');
      s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
      document.head.appendChild(s);
    }
    const el = live
      ? document.querySelector('.elementor-testimonial-content')
      : document.querySelector('.testimonial__quote');
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo(0, top);
    return top;
  }, isLive);

  await new Promise(r => setTimeout(r, 500));

  const data = await page.evaluate((live) => {
    const q = live
      ? document.querySelector('.elementor-testimonial-content')
      : document.querySelector('.testimonial__quote');
    const n = live
      ? document.querySelector('.elementor-testimonial-name')
      : document.querySelector('.testimonial__author');
    const j = live
      ? document.querySelector('.elementor-testimonial-job')
      : document.querySelector('.testimonial__role');

    function props(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      return {
        fontFamily: c.fontFamily,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        fontStyle: c.fontStyle,
        lineHeight: c.lineHeight,
        letterSpacing: c.letterSpacing,
        textTransform: c.textTransform,
        color: c.color,
      };
    }
    return { quote: props(q), name: props(n), job: props(j) };
  }, isLive);

  await page.screenshot({ path: `reference/testimonial-font-${label}.png` });
  console.log(`\n=== ${label.toUpperCase()} ===`);
  Object.entries(data).forEach(([k, v]) => {
    if (!v) return;
    console.log(`  ${k}:`);
    Object.entries(v).forEach(([p, val]) => console.log(`    ${p.padEnd(16)}: ${val}`));
  });

  await page.close();
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  await check(browser, 'https://www.gptechadvisors.com', 'live', true);
  await check(browser, 'http://localhost:8765', 'local', false);
  await browser.close();
  srv.close();
}
main().catch(console.error);
