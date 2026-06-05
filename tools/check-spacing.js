/**
 * Check spacing (margin/padding/gap) between text elements on live vs local.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8765;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startServer(root, port) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let fp = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(fp);
      const types = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webp':'image/webp' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      fs.createReadStream(fp).pipe(res);
    });
    srv.listen(port, () => resolve(srv));
  });
}

function sp(val) { return val.padEnd(12); }

async function getSpacing(page, isLive) {
  return page.evaluate((isLive) => {
    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top + window.scrollY),
        bottom: Math.round(r.bottom + window.scrollY),
        mt: c.marginTop, mb: c.marginBottom,
        pt: c.paddingTop, pb: c.paddingBottom,
        fs: c.fontSize, lh: c.lineHeight,
      };
    }

    const results = {};

    // HERO elements
    const heroEyebrow = document.querySelector('.hero--home .hero__eyebrow, .hero--home [class*="eyebrow"]');
    const heroH1 = document.querySelector('.hero--home h1');
    const heroBody = document.querySelector('.hero--home .hero__content > p, .hero--home p');
    const heroSection = document.querySelector('.hero--home, section.hero');

    // On live, use Elementor selectors
    const liveEyebrow = isLive
      ? Array.from(document.querySelectorAll('.elementor-heading-title')).find(el => el.textContent.includes('Scale Cybersecurity'))
      : heroEyebrow;
    const liveH1 = isLive
      ? document.querySelector('h1')
      : heroH1;
    const liveBody = isLive
      ? document.querySelector('h1 + p, .elementor-widget-text-editor p')
      : heroBody;

    results.heroEyebrow = cs(liveEyebrow);
    results.heroH1 = cs(liveH1);
    results.heroBody = cs(liveBody);
    results.heroSection = cs(heroSection || document.querySelector('section'));

    // Gap between elements (bottom of prev - top of next)
    if (results.heroEyebrow && results.heroH1)
      results.gapEyebrowToH1 = results.heroH1.top - results.heroEyebrow.bottom;
    if (results.heroH1 && results.heroBody)
      results.gapH1ToBody = results.heroBody.top - results.heroH1.bottom;

    // PILLARS section
    const pillarsHeading = document.querySelector('.pillars-section__heading, h2');
    const pillarsIntro = document.querySelector('.pillars-section__intro');
    results.pillarsHeading = cs(pillarsHeading);
    results.pillarsIntro = cs(pillarsIntro);
    if (results.pillarsHeading && results.pillarsIntro)
      results.gapPillarsHeadingToIntro = results.pillarsIntro.top - results.pillarsHeading.bottom;

    // SERVICES section
    const servicesEyebrow = document.querySelector('.services-overview__eyebrow');
    const servicesH2 = document.querySelector('.services-overview h2');
    const accordionItem1 = document.querySelector('.services-accordion__item, .e-n-accordion-item');
    const accordionItem2 = document.querySelectorAll('.services-accordion__item, .e-n-accordion-item')[1];
    results.servicesEyebrow = cs(servicesEyebrow);
    results.servicesH2 = cs(servicesH2);
    results.accordionItem1 = cs(accordionItem1);
    results.accordionItem2 = cs(accordionItem2);
    if (results.servicesEyebrow && results.servicesH2)
      results.gapServicesEyebrowToH2 = results.servicesH2.top - results.servicesEyebrow.bottom;
    if (results.servicesH2 && results.accordionItem1)
      results.gapServicesH2ToAccordion = results.accordionItem1.top - results.servicesH2.bottom;

    // BLOG section
    const blogH2 = document.querySelector('.blog-highlights h2');
    const blogIntro = document.querySelector('.blog-highlights__intro');
    results.blogH2 = cs(blogH2);
    results.blogIntro = cs(blogIntro);
    if (results.blogH2 && results.blogIntro)
      results.gapBlogH2ToIntro = results.blogIntro.top - results.blogH2.bottom;

    // TESTIMONIAL
    const testimonialQuote = document.querySelector('.testimonial__quote, .elementor-testimonial-content');
    const testimonialMeta = document.querySelector('.testimonial__meta, .elementor-testimonial-meta');
    results.testimonialQuote = cs(testimonialQuote);
    results.testimonialMeta = cs(testimonialMeta);
    if (results.testimonialQuote && results.testimonialMeta)
      results.gapQuoteToMeta = results.testimonialMeta.top - results.testimonialQuote.bottom;

    return results;
  }, isLive);
}

async function main() {
  const srv = await startServer(path.join(__dirname, '..'), LOCAL_PORT);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  const livePage = await browser.newPage();
  await livePage.setViewport({ width: 1280, height: 900 });
  await livePage.goto(LIVE, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const liveData = await getSpacing(livePage, true);

  const localPage = await browser.newPage();
  await localPage.setViewport({ width: 1280, height: 900 });
  await localPage.goto(`http://localhost:${LOCAL_PORT}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const localData = await getSpacing(localPage, false);

  console.log('\n' + '='.repeat(70));
  console.log('SPACING COMPARISON — LIVE vs LOCAL');
  console.log('='.repeat(70));

  const gaps = [
    ['Hero: eyebrow → h1 gap',     'gapEyebrowToH1'],
    ['Hero: h1 → body gap',         'gapH1ToBody'],
    ['Hero eyebrow margin-bottom',  'heroEyebrow', 'mb'],
    ['Hero h1 margin-bottom',       'heroH1', 'mb'],
    ['Hero body margin-bottom',     'heroBody', 'mb'],
    ['Pillars heading → intro gap', 'gapPillarsHeadingToIntro'],
    ['Pillars heading mb',          'pillarsHeading', 'mb'],
    ['Services eyebrow → h2 gap',   'gapServicesEyebrowToH2'],
    ['Services h2 → accordion gap', 'gapServicesH2ToAccordion'],
    ['Services eyebrow mb',         'servicesEyebrow', 'mb'],
    ['Services h2 mb',              'servicesH2', 'mb'],
    ['Blog h2 → intro gap',         'gapBlogH2ToIntro'],
    ['Blog h2 mb',                  'blogH2', 'mb'],
    ['Testimonial quote mb',        'testimonialQuote', 'mb'],
    ['Quote → meta gap',            'gapQuoteToMeta'],
  ];

  for (const row of gaps) {
    const [label, key, prop] = row;
    let liveVal, localVal;
    if (prop) {
      liveVal  = liveData[key]  ? liveData[key][prop]  : 'NOT FOUND';
      localVal = localData[key] ? localData[key][prop] : 'NOT FOUND';
    } else {
      liveVal  = liveData[key]  != null ? liveData[key] + 'px'  : 'NOT FOUND';
      localVal = localData[key] != null ? localData[key] + 'px' : 'NOT FOUND';
    }
    const diff = liveVal !== localVal ? ' ← DIFF' : '';
    console.log(`  ${label.padEnd(34)} LIVE: ${sp(String(liveVal))} LOCAL: ${sp(String(localVal))}${diff}`);
  }

  await browser.close();
  srv.close();
}

main().catch(console.error);
