/**
 * Deep comparison of the blog highlights section: live vs local.
 * Extracts full computed styles, structure, and screenshots.
 */
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

const PROPS = ['font-family','font-size','font-weight','font-style','line-height','letter-spacing',
  'text-transform','text-align','color','background-color','padding-top','padding-bottom',
  'padding-left','padding-right','margin-top','margin-bottom','display','gap',
  'border-radius','box-shadow','overflow','width','max-width'];

function measure(el, props) {
  if (!el) return null;
  const c = window.getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const result = { _h: Math.round(r.height), _w: Math.round(r.width), _left: Math.round(r.left) };
  props.forEach(p => { result[p] = c.getPropertyValue(p).trim(); });
  return result;
}

async function analyzeLive(page) {
  await page.goto('https://www.gptechadvisors.com', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  return page.evaluate((PROPS) => {
    // Find blog section
    const blogH2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts') || h.textContent.includes('Insights'));
    const blogSection = blogH2?.closest('section, .e-con-boxed, .e-con, [data-element_type]');

    // Find the CTA button
    const ctaEl = blogSection?.querySelector('a[href*="blog"], a[href*="Blog"]') ||
      Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Blog Posts') && a.href.includes('blog'));
    const ctaWrapper = ctaEl?.parentElement;

    // Blog section structure
    const introEl = blogSection?.querySelector('.elementor-widget-text-editor p, p');

    // Find button text
    const ctaText = ctaEl?.textContent.trim();

    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const result = { _h: Math.round(r.height), _w: Math.round(r.width), _left: Math.round(r.left), _text: el.textContent.trim().substring(0, 60) };
      PROPS.forEach(p => { result[p] = c.getPropertyValue(p).trim(); });
      return result;
    }

    return {
      section: cs(blogSection),
      h2: cs(blogH2),
      intro: cs(introEl),
      ctaButton: cs(ctaEl),
      ctaText,
    };
  }, PROPS);
}

async function analyzeLocal(page) {
  await new Promise(r => setTimeout(r, 1500));
  return page.evaluate((PROPS) => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const style = document.createElement('style');
    style.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
    document.head.appendChild(style);

    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const result = { _h: Math.round(r.height), _w: Math.round(r.width), _left: Math.round(r.left), _text: el.textContent.trim().substring(0, 60) };
      PROPS.forEach(p => { result[p] = c.getPropertyValue(p).trim(); });
      return result;
    }

    const section = document.querySelector('.blog-highlights');
    const h2 = document.querySelector('.blog-highlights h2');
    const intro = document.querySelector('.blog-highlights__intro');
    const grid = document.querySelector('#home-blog-grid');
    const card = document.querySelector('#home-blog-grid .blog-card');
    const cardImg = document.querySelector('#home-blog-grid .card__image');
    const cardTag = document.querySelector('#home-blog-grid .card__tag');
    const cardTitle = document.querySelector('#home-blog-grid .card__title');
    const cardBody = document.querySelector('#home-blog-grid .card__body, #home-blog-grid .blog-card__category');
    const ctaBtn = document.querySelector('.blog-highlights__cta a');
    const ctaWrapper = document.querySelector('.blog-highlights__cta');

    return {
      section: cs(section),
      h2: cs(h2),
      intro: cs(intro),
      grid: cs(grid),
      card: cs(card),
      cardImg: cs(cardImg),
      cardTag: cs(cardTag),
      cardTitle: cs(cardTitle),
      ctaWrapper: cs(ctaWrapper),
      ctaButton: cs(ctaBtn),
    };
  }, PROPS);
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  // LIVE
  const livePage = await browser.newPage();
  await livePage.setViewport({ width: 1280, height: 900 });
  const liveData = await analyzeLive(livePage);

  // Scroll to blog section and screenshot
  await livePage.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts'));
    if (h2) window.scrollTo(0, h2.getBoundingClientRect().top + window.scrollY - 60);
  });
  await new Promise(r => setTimeout(r, 500));
  await livePage.screenshot({ path: 'reference/blog-deep-live.png' });
  await livePage.close();

  // LOCAL
  const localPage = await browser.newPage();
  await localPage.setViewport({ width: 1280, height: 900 });
  await localPage.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 30000 });
  const localData = await analyzeLocal(localPage);

  await localPage.evaluate(() => {
    const el = document.querySelector('.blog-highlights');
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 20);
  });
  await new Promise(r => setTimeout(r, 500));
  await localPage.screenshot({ path: 'reference/blog-deep-local.png' });
  await localPage.close();

  await browser.close();
  srv.close();

  // DIFF REPORT
  console.log('\n========== LIVE DATA ==========');
  console.log(JSON.stringify(liveData, null, 2));
  console.log('\n========== LOCAL DATA ==========');
  console.log(JSON.stringify(localData, null, 2));

  console.log('\n========== DIFFS (section) ==========');
  const IGNORE = ['font-family','text-align'];
  const liveSection = liveData.section || {};
  const localSection = localData.section || {};
  PROPS.forEach(p => {
    if (IGNORE.includes(p)) return;
    if (liveSection[p] !== localSection[p] && liveSection[p] !== undefined) {
      console.log(`  section.${p}: LIVE=${liveSection[p]}  LOCAL=${localSection[p]}`);
    }
  });

  console.log('\n========== DIFFS (h2) ==========');
  const liveH2 = liveData.h2 || {};
  const localH2 = localData.h2 || {};
  PROPS.forEach(p => {
    if (IGNORE.includes(p)) return;
    if (liveH2[p] !== localH2[p] && liveH2[p] !== undefined) {
      console.log(`  h2.${p}: LIVE=${liveH2[p]}  LOCAL=${localH2[p]}`);
    }
  });

  console.log('\n========== DIFFS (intro) ==========');
  const liveIntro = liveData.intro || {};
  const localIntro = localData.intro || {};
  PROPS.forEach(p => {
    if (IGNORE.includes(p)) return;
    if (liveIntro[p] !== localIntro[p] && liveIntro[p] !== undefined) {
      console.log(`  intro.${p}: LIVE=${liveIntro[p]}  LOCAL=${localIntro[p]}`);
    }
  });

  console.log('\n========== CTA BUTTON ==========');
  console.log('  LIVE:', JSON.stringify(liveData.ctaButton));
  console.log('  LOCAL:', JSON.stringify(localData.ctaButton));
}
main().catch(console.error);
