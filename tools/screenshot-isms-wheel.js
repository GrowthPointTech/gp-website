const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'reference');

function startServer(port) {
  return new Promise(resolve => {
    const mime = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
                   '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2' };
    const s = http.createServer((req, res) => {
      const fp = path.join(ROOT, req.url.split('?')[0]);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'text/plain' });
      fs.createReadStream(fp).pipe(res);
    });
    s.listen(port, () => resolve(s));
  });
}

(async () => {
  const server = await startServer(3001);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  await page.goto('http://localhost:3001/services/ciso.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Take full-page screenshot
  const fullPath = path.join(OUT, 'isms-wheel-LOCAL-full.png');
  await page.screenshot({ path: fullPath, fullPage: true });

  // Get the ISMS section's absolute position on the full page
  const info = await page.evaluate(() => {
    const el = document.querySelector('.isms-section--services');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height, width: r.width };
  });
  console.log('ISMS section:', info);
  console.log('Full-page screenshot saved. Crop manually to y=' + info?.top + ', height=' + info?.height);

  // Also save the wheel SVG as text for inspection
  const svgData = await page.evaluate(() => {
    const svg = document.querySelector('#isms-wheel svg');
    return svg ? svg.outerHTML.substring(0, 500) : 'not found';
  });
  console.log('\nSVG preview:', svgData);

  await browser.close();
  server.close();
})();
