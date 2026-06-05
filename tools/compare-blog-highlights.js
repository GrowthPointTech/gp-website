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

function cs(el, props) {
  if (!el) return null;
  const c = window.getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const result = { h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left) };
  props.forEach(p => result[p] = c.getPropertyValue(p).trim());
  return result;
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
    // Find the blog highlights section
    const el = live
      ? Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts') || h.textContent.includes('Insights'))?.closest('section, .e-con-boxed, .e-con')
      : document.querySelector('.blog-highlights');
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo(0, top);
    return top;
  }, isLive);

  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `reference/blog-hl-${label}.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } });

  const data = await page.evaluate((live) => {
    const LAYOUT = ['background-color','padding-top','padding-bottom','padding-left','padding-right','display','gap','text-align'];
    const TEXT   = ['font-size','font-weight','font-family','line-height','letter-spacing','color','text-align','text-transform'];

    function measure(sel, props) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const result = { h: Math.round(r.height), w: Math.round(r.width) };
      props.forEach(p => result[p] = c.getPropertyValue(p).trim());
      return result;
    }

    if (live) {
      const h2El = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts') || h.textContent.includes('Insights'));
      const section = h2El?.closest('section, .e-con-boxed, .e-con');
      const intro = section?.querySelector('p, .elementor-widget-text-editor');
      const card = section?.querySelector('.elementor-post, article, .swiper-slide');
      const btn = section?.querySelector('a[href*="blog"]');
      return {
        section: section ? (() => { const c=window.getComputedStyle(section); const r=section.getBoundingClientRect(); return { h:Math.round(r.h||r.height), w:Math.round(r.width), bg:c.backgroundColor, pt:c.paddingTop, pb:c.paddingBottom, display:c.display, gap:c.gap }; })() : null,
        h2: h2El ? (() => { const c=window.getComputedStyle(h2El); const r=h2El.getBoundingClientRect(); return { h:Math.round(r.height), fs:c.fontSize, fw:c.fontWeight, color:c.color, lh:c.lineHeight, ta:c.textAlign }; })() : null,
        intro: intro ? (() => { const c=window.getComputedStyle(intro); return { fs:c.fontSize, fw:c.fontWeight, color:c.color, ta:c.textAlign, mb:c.marginBottom }; })() : null,
        btn: btn ? (() => { const c=window.getComputedStyle(btn); return { text:btn.textContent.trim().substring(0,40), fs:c.fontSize, bg:c.backgroundColor, color:c.color, padding:c.padding, borderRadius:c.borderRadius }; })() : null,
      };
    } else {
      return {
        section: measure('.blog-highlights', LAYOUT),
        h2: measure('.blog-highlights h2', TEXT),
        intro: measure('.blog-highlights__intro', TEXT),
        card: measure('#home-blog-grid .blog-card, #home-blog-grid .card', [...LAYOUT, 'border-radius', 'overflow']),
        cardTitle: measure('#home-blog-grid .card__title, #home-blog-grid h3', TEXT),
        cardTag: measure('#home-blog-grid .card__tag', TEXT),
        btn: measure('.blog-highlights__cta a', [...TEXT, 'background-color', 'padding', 'border-radius']),
        cta: measure('.blog-highlights__cta', LAYOUT),
        grid: measure('#home-blog-grid', LAYOUT),
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
}
main().catch(console.error);
