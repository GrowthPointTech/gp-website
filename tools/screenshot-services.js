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

async function shoot(browser, url, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Measure services section position in full-page coordinates
  const rect = await page.evaluate(() => {
    // Force all scroll-animate elements visible so we can see the section
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const el = document.querySelector('.services-overview') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'))
        ?.closest('section, .e-con-boxed, [data-element_type]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height), width: Math.round(r.width) };
  });

  if (!rect) { console.log(label, 'section not found'); await page.close(); return; }

  // Screenshot full page and crop services section
  const full = await page.screenshot({ fullPage: true });
  fs.writeFileSync(`reference/services-crop-${label}.png`, full);

  // Now crop just the services section
  const Jimp = null; // skip jimp, use clip directly
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: rect.height + 40 });
  await page2.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 500));
  await page2.evaluate((top) => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    window.scrollTo(0, top - 20);
  }, rect.top);
  await new Promise(r => setTimeout(r, 300));
  await page2.screenshot({
    path: `reference/services-zoom-${label}.png`,
    clip: { x: 0, y: 0, width: 1280, height: Math.min(rect.height + 40, 900) }
  });

  const stats = await page2.evaluate(() => {
    const s = document.querySelector('.services-overview');
    const photo = document.querySelector('.services-overview__photo img');
    const inner = document.querySelector('.services-overview__inner');
    const cs = s ? window.getComputedStyle(s) : {};
    const ics = inner ? window.getComputedStyle(inner) : {};
    const r = s ? s.getBoundingClientRect() : {};
    return {
      sectionH: Math.round(r.height || 0),
      bg: cs.backgroundColor,
      innerPt: ics.paddingTop, innerPb: ics.paddingBottom,
      photoH: photo ? Math.round(photo.getBoundingClientRect().height) : null,
    };
  });

  await page2.close();
  await page.close();
  console.log(label, JSON.stringify(stats));
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  await shoot(browser, 'https://www.gptechadvisors.com', 'live');
  await shoot(browser, 'http://localhost:8765',          'local');
  await browser.close();
  srv.close();
}
main().catch(console.error);
