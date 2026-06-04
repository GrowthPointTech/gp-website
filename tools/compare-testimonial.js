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

async function shoot(browser, url, label, isLive) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const scrollY = await page.evaluate((live) => {
    if (!live) {
      document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
      const s = document.createElement('style');
      s.textContent = '.scroll-animate { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; }';
      document.head.appendChild(s);
    }
    const el = live
      ? document.querySelector('.elementor-testimonial-wrapper, .elementor-widget-testimonial')
      : document.querySelector('.testimonial');
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo(0, top);
    return top;
  }, isLive);

  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `reference/testimonial-${label}.png` });

  const stats = await page.evaluate((live) => {
    function cs(sel) {
      const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        h: Math.round(r.height), w: Math.round(r.width),
        pt: c.paddingTop, pb: c.paddingBottom,
        pl: c.paddingLeft, pr: c.paddingRight,
        mt: c.marginTop, mb: c.marginBottom,
        bg: c.backgroundColor,
        fs: c.fontSize, fw: c.fontWeight,
        fontStyle: c.fontStyle,
        lineHeight: c.lineHeight,
        color: c.color,
        textAlign: c.textAlign,
      };
    }

    if (live) {
      const section = document.querySelector('.elementor-widget-testimonial')?.closest('section, .e-con, .e-con-boxed') ||
                      document.querySelector('.elementor-testimonial-wrapper')?.closest('section, .e-con');
      const quote = document.querySelector('.elementor-testimonial-content');
      const name = document.querySelector('.elementor-testimonial-name');
      const job = document.querySelector('.elementor-testimonial-job');
      const img = document.querySelector('.elementor-testimonial-image img');
      return {
        section: section ? cs(section) : null,
        quote: quote ? cs(quote) : null,
        name: name ? cs(name) : null,
        job: job ? cs(job) : null,
        hasPhoto: !!img,
        photoSize: img ? { w: img.offsetWidth, h: img.offsetHeight } : null,
      };
    } else {
      const section = document.querySelector('.testimonial');
      const quote = document.querySelector('.testimonial__quote');
      const meta = document.querySelector('.testimonial__meta');
      const name = document.querySelector('.testimonial__author');
      const job = document.querySelector('.testimonial__role');
      const img = document.querySelector('.testimonial__photo');
      return {
        section: section ? cs(section) : null,
        quote: quote ? cs(quote) : null,
        meta: meta ? cs(meta) : null,
        name: name ? cs(name) : null,
        job: job ? cs(job) : null,
        hasPhoto: !!img,
        photoSize: img ? { w: img.offsetWidth, h: img.offsetHeight } : null,
      };
    }
  }, isLive);

  console.log(`\n=== ${label.toUpperCase()} ===`);
  console.log(JSON.stringify(stats, null, 2));
  await page.close();
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  await shoot(browser, 'https://www.gptechadvisors.com', 'live', true);
  await shoot(browser, 'http://localhost:8765', 'local', false);
  await browser.close();
  srv.close();
  console.log('\nScreenshots: reference/testimonial-live.png & testimonial-local.png');
}
main().catch(console.error);
