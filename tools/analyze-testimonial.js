/**
 * Deep analysis of the live testimonial section structure and styles.
 * Compares every measurable property against our local version.
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

function allProps(el) {
  if (!el) return null;
  const c = window.getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName, class: el.className.substring(0, 60),
    rect: { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left) },
    bg: c.backgroundColor, bgImage: c.backgroundImage.substring(0, 80),
    pt: c.paddingTop, pb: c.paddingBottom, pl: c.paddingLeft, pr: c.paddingRight,
    mt: c.marginTop, mb: c.marginBottom,
    display: c.display, flexDir: c.flexDirection, gap: c.gap,
    alignItems: c.alignItems, justifyContent: c.justifyContent,
    maxWidth: c.maxWidth, width: c.width,
    position: c.position, overflow: c.overflow,
    fs: c.fontSize, fw: c.fontWeight, lh: c.lineHeight,
    ls: c.letterSpacing, fi: c.fontStyle, tt: c.textTransform,
    color: c.color, textAlign: c.textAlign,
  };
}

async function analyzeLive(page) {
  await page.goto('https://www.gptechadvisors.com', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  return page.evaluate(() => {
    // Find the testimonial wrapper
    const wrapper = document.querySelector('.elementor-testimonial-wrapper');
    if (!wrapper) return { error: 'no testimonial wrapper' };

    // Walk up to find all ancestor containers
    const ancestors = [];
    let el = wrapper.parentElement;
    for (let i = 0; i < 8 && el && el !== document.body; i++) {
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      ancestors.push({
        tag: el.tagName, class: el.className.substring(0, 80),
        h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left), top: Math.round(r.top + window.scrollY),
        bg: c.backgroundColor, bgImg: c.backgroundImage.substring(0, 100),
        pt: c.paddingTop, pb: c.paddingBottom, pl: c.paddingLeft, pr: c.paddingRight,
        display: c.display, flexDir: c.flexDirection, gap: c.gap,
      });
      el = el.parentElement;
    }

    // Find siblings of the testimonial container (left column with shapes)
    const testimonialContainer = wrapper.closest('[data-element_type="container"], .e-con');
    const parentContainer = testimonialContainer?.parentElement;
    const siblings = parentContainer ? Array.from(parentContainer.children).map(child => {
      const c = window.getComputedStyle(child);
      const r = child.getBoundingClientRect();
      return {
        class: child.className.substring(0, 80),
        h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left),
        bg: c.backgroundColor, bgImg: c.backgroundImage.substring(0, 200),
        display: c.display, flex: c.flex, width: c.width,
        visible: c.display !== 'none',
      };
    }) : [];

    // Outer section (with the grey bg)
    const outerSection = wrapper.closest('section, .e-con-boxed, [data-element_type="section"]');
    const outerC = outerSection ? window.getComputedStyle(outerSection) : null;
    const outerR = outerSection ? outerSection.getBoundingClientRect() : null;

    // Content elements
    const quote = document.querySelector('.elementor-testimonial-content');
    const meta = document.querySelector('.elementor-testimonial-meta');
    const metaInner = document.querySelector('.elementor-testimonial-meta-inner');
    const name = document.querySelector('.elementor-testimonial-name');
    const job = document.querySelector('.elementor-testimonial-job');
    const photo = document.querySelector('.elementor-testimonial-image img');

    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left),
        bg: c.backgroundColor,
        pt: c.paddingTop, pb: c.paddingBottom, pl: c.paddingLeft, pr: c.paddingRight,
        mt: c.marginTop, mb: c.marginBottom,
        display: c.display, flexDir: c.flexDirection, gap: c.gap, alignItems: c.alignItems,
        fs: c.fontSize, fw: c.fontWeight, lh: c.lineHeight, ls: c.letterSpacing,
        fi: c.fontStyle, tt: c.textTransform, color: c.color, ta: c.textAlign,
      };
    }

    return {
      outerSection: outerSection ? {
        h: Math.round(outerR.height), w: Math.round(outerR.width),
        bg: outerC.backgroundColor, bgImg: outerC.backgroundImage.substring(0,100),
        pt: outerC.paddingTop, pb: outerC.paddingBottom,
        pl: outerC.paddingLeft, pr: outerC.paddingRight,
        display: outerC.display, gap: outerC.gap,
      } : null,
      siblings,
      ancestors: ancestors.slice(0, 5),
      quote: cs(quote),
      meta: cs(meta),
      metaInner: cs(metaInner),
      name: cs(name),
      job: cs(job),
      photoSize: photo ? { w: photo.offsetWidth, h: photo.offsetHeight } : null,
    };
  });
}

async function analyzeLocal(page) {
  const scrollY = await page.evaluate(() => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const s = document.createElement('style');
    s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
    document.head.appendChild(s);
    const el = document.querySelector('.testimonial');
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top);
    return top;
  });
  await new Promise(r => setTimeout(r, 500));

  return page.evaluate(() => {
    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left),
        bg: c.backgroundColor,
        pt: c.paddingTop, pb: c.paddingBottom, pl: c.paddingLeft, pr: c.paddingRight,
        mt: c.marginTop, mb: c.marginBottom,
        display: c.display, flexDir: c.flexDirection, gap: c.gap, alignItems: c.alignItems,
        fs: c.fontSize, fw: c.fontWeight, lh: c.lineHeight, ls: c.letterSpacing,
        fi: c.fontStyle, tt: c.textTransform, color: c.color, ta: c.textAlign,
      };
    }
    return {
      section: cs(document.querySelector('.testimonial')),
      container: cs(document.querySelector('.testimonial .container')),
      quote: cs(document.querySelector('.testimonial__quote')),
      meta: cs(document.querySelector('.testimonial__meta')),
      name: cs(document.querySelector('.testimonial__author')),
      job: cs(document.querySelector('.testimonial__role')),
      photo: cs(document.querySelector('.testimonial__photo')),
    };
  });
}

async function screenshot(page, url, file, isLive) {
  if (isLive) {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
  }
  const top = await page.evaluate((live) => {
    if (!live) {
      document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
      const s = document.createElement('style');
      s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
      document.head.appendChild(s);
    }
    const el = live
      ? document.querySelector('.elementor-testimonial-wrapper')?.closest('[data-element_type]') || document.querySelector('.elementor-testimonial-wrapper')
      : document.querySelector('.testimonial');
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY - 30;
    window.scrollTo(0, top);
    return top;
  }, isLive);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1280, height: 900 } });
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  const livePage = await browser.newPage();
  await livePage.setViewport({ width: 1280, height: 900 });
  const liveData = await analyzeLive(livePage);
  await screenshot(livePage, 'https://www.gptechadvisors.com', 'reference/testimonial-deep-live.png', true);
  await livePage.close();

  const localPage = await browser.newPage();
  await localPage.setViewport({ width: 1280, height: 900 });
  await localPage.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  const localData = await analyzeLocal(localPage);
  await screenshot(localPage, '', 'reference/testimonial-deep-local.png', false);
  await localPage.close();

  await browser.close();
  srv.close();

  console.log('\n====== LIVE STRUCTURE ======');
  console.log(JSON.stringify(liveData, null, 2));
  console.log('\n====== LOCAL STRUCTURE ======');
  console.log(JSON.stringify(localData, null, 2));

  console.log('\n====== KEY DIFFS (quote) ======');
  const lq = liveData.quote, loq = localData.quote;
  if (lq && loq) {
    const keys = ['h','w','pt','pb','pl','pr','mt','mb','fs','fw','lh','ls','fi','tt','color','ta','bg'];
    keys.forEach(k => { if (lq[k] !== loq[k]) console.log(`  quote.${k}: LIVE=${lq[k]} LOCAL=${loq[k]}`); });
  }
  console.log('\n====== KEY DIFFS (meta/photo row) ======');
  const lm = liveData.metaInner, lom = localData.meta;
  if (lm && lom) {
    const keys = ['h','w','display','flexDir','gap','alignItems'];
    keys.forEach(k => { if (lm[k] !== lom[k]) console.log(`  meta.${k}: LIVE=${lm[k]} LOCAL=${lom[k]}`); });
  }
}
main().catch(console.error);
