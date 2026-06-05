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

async function inspect(browser, url, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll to services section so IntersectionObserver fires
  await page.evaluate(() => {
    const el = document.querySelector('.services-overview') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'))?.closest('section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));

  const data = await page.evaluate(() => {
    function cs(sel) {
      const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        h: Math.round(r.height), w: Math.round(r.width),
        pt: c.paddingTop, pb: c.paddingBottom,
        mt: c.marginTop, mb: c.marginBottom,
        bg: c.backgroundColor,
        display: c.display,
      };
    }

    const section = document.querySelector('.services-overview') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'))
        ?.closest('section, .e-con-boxed, [data-element_type="section"]');

    // Find the accordion/service items
    const items = document.querySelectorAll('.services-accordion__item, .e-n-accordion-item');
    const firstItem = items[0];
    const firstTitle = firstItem?.querySelector('.services-accordion__title, .e-n-accordion-item-title');
    const firstIcon  = firstItem?.querySelector('.services-accordion__icon, .e-n-accordion-item-title-icon');
    const openIcon   = firstItem?.querySelector('.services-accordion__icon--open, .e-opened');
    const closedIcon = firstItem?.querySelector('.services-accordion__icon--closed, .e-closed');

    const photo = document.querySelector('.services-overview__photo img, .elementor-widget-image img');

    const iconOpen  = openIcon   ? window.getComputedStyle(openIcon)   : null;
    const iconClose = closedIcon ? window.getComputedStyle(closedIcon) : null;

    return {
      section:      cs(section),
      firstItem:    cs(firstItem),
      firstTitle:   cs(firstTitle),
      firstIconEl:  cs(firstIcon),
      openIconDisplay:   iconOpen   ? iconOpen.display   : null,
      closedIconDisplay: iconClose  ? iconClose.display  : null,
      photoVisible: photo ? window.getComputedStyle(photo).opacity : null,
      itemCount:    items.length,
    };
  });

  // Screenshot of services section
  const clip = await page.evaluate(() => {
    const el = document.querySelector('.services-overview') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'))
        ?.closest('section, .e-con-boxed');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: 0, y: Math.max(0, r.top - 20), width: 1280, height: Math.min(r.height + 40, 900) };
  });

  if (clip) {
    await page.screenshot({ path: `reference/services-zoom-${label}.png`, clip });
  }

  await page.close();
  return data;
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });

  const live  = await inspect(browser, 'https://www.gptechadvisors.com', 'live');
  const local = await inspect(browser, 'http://localhost:8765',           'local');

  await browser.close();
  srv.close();

  console.log('\n=== LIVE ===');
  console.log(JSON.stringify(live, null, 2));
  console.log('\n=== LOCAL ===');
  console.log(JSON.stringify(local, null, 2));

  console.log('\n=== DIFF ===');
  const keys = ['h', 'pt', 'pb', 'bg'];
  ['section', 'firstItem', 'firstTitle'].forEach(k => {
    keys.forEach(p => {
      const lv = live[k]?.[p], lo = local[k]?.[p];
      if (lv !== lo) console.log(`  ${k}.${p}: LIVE=${lv} LOCAL=${lo}`);
    });
  });
  console.log('  openIcon display:   LIVE=' + live.openIconDisplay  + ' LOCAL=' + local.openIconDisplay);
  console.log('  closedIcon display: LIVE=' + live.closedIconDisplay + ' LOCAL=' + local.closedIconDisplay);
  console.log('  photo opacity:      LIVE=' + live.photoVisible      + ' LOCAL=' + local.photoVisible);
}
main().catch(console.error);
