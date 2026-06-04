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
      s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
      document.head.appendChild(s);
    }
    const el = live
      ? Array.from(document.querySelectorAll('[class*="swiper"], [data-widget_type*="slides"]')).find(e => e.offsetHeight > 100)
        || document.querySelector('.elementor-slides-wrapper, .swiper')
      : document.querySelector('.pillar-slider');
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo(0, top);
    return top;
  }, isLive);

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `reference/pillar-slider-${label}.png` });

  const data = await page.evaluate((live) => {
    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left),
        bg: c.backgroundColor,
        pt: c.paddingTop, pb: c.paddingBottom, pl: c.paddingLeft, pr: c.paddingRight,
        borderRadius: c.borderRadius,
        display: c.display,
        maxWidth: c.maxWidth,
      };
    }

    if (live) {
      const slider = document.querySelector('.elementor-slides-wrapper, .swiper-container, .swiper');
      const slide  = document.querySelector('.swiper-slide, .elementor-slide');
      const heading = document.querySelector('.elementor-slide-heading, [class*="slide-heading"]');
      const desc    = document.querySelector('.elementor-slide-description, [class*="slide-desc"]');
      const section = slider?.closest('section, .e-con-boxed, [data-element_type]');
      return { section: cs(section), slider: cs(slider), slide: cs(slide), heading: cs(heading), desc: cs(desc) };
    } else {
      return {
        slider:  cs(document.querySelector('.pillar-slider')),
        track:   cs(document.querySelector('.pillar-slider__track')),
        slide:   cs(document.querySelector('.pillar-slider__slide--active')),
        heading: cs(document.querySelector('.pillar-slider__heading')),
        desc:    cs(document.querySelector('.pillar-slider__desc')),
      };
    }
  }, isLive);

  console.log(`\n=== ${label.toUpperCase()} ===`);
  console.log(JSON.stringify(data, null, 2));
  await page.close();
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  await shoot(browser, 'https://www.gptechadvisors.com', 'live', true);
  await shoot(browser, 'http://localhost:8765', 'local', false);
  await browser.close();
  srv.close();
  console.log('\nScreenshots: reference/pillar-slider-live.png & pillar-slider-local.png');
}
main().catch(console.error);
