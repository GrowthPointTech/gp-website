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

async function measure(browser, url, label, isLive) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const data = await page.evaluate((live) => {
    if (!live) {
      document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
      const s = document.createElement('style');
      s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
      document.head.appendChild(s);
    }

    let sliderEl, headingEl, descEl;

    if (live) {
      // On live, find the active swiper slide
      sliderEl  = document.querySelector('.elementor-slides-wrapper, .swiper');
      headingEl = document.querySelector('.swiper-slide-active .elementor-slide-heading, .elementor-slides .swiper-slide:first-child .elementor-slide-heading');
      descEl    = document.querySelector('.swiper-slide-active .elementor-slide-description, .elementor-slides .swiper-slide:first-child .elementor-slide-description');
      // Fallback: find by text
      if (!headingEl) headingEl = Array.from(document.querySelectorAll('[class*="slide-heading"]'))[0];
    } else {
      sliderEl  = document.querySelector('.pillar-slider');
      headingEl = document.querySelector('.pillar-slider__slide--active .pillar-slider__heading');
      descEl    = document.querySelector('.pillar-slider__slide--active .pillar-slider__desc');
    }

    if (!sliderEl || !headingEl) return null;

    const sliderRect  = sliderEl.getBoundingClientRect();
    const headingRect = headingEl.getBoundingClientRect();
    const descRect    = descEl ? descEl.getBoundingClientRect() : null;

    return {
      sliderTop: Math.round(sliderRect.top + window.scrollY),
      sliderH: Math.round(sliderRect.height),
      headingTop: Math.round(headingRect.top + window.scrollY),
      headingFromSliderTop: Math.round(headingRect.top - sliderRect.top),
      descFromSliderTop: descRect ? Math.round(descRect.top - sliderRect.top) : null,
    };
  }, isLive);

  console.log(`\n${label}: ${JSON.stringify(data)}`);
  await page.close();
  return data;
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const live  = await measure(browser, 'https://www.gptechadvisors.com', 'LIVE',  true);
  const local = await measure(browser, 'http://localhost:8765',           'LOCAL', false);
  await browser.close();
  srv.close();

  if (live && local) {
    console.log('\n=== DIFF ===');
    console.log(`Heading from slider top — LIVE: ${live.headingFromSliderTop}px  LOCAL: ${local.headingFromSliderTop}px`);
    console.log(`Need to move text by: ${live.headingFromSliderTop - local.headingFromSliderTop}px`);
  }
}
main().catch(console.error);
