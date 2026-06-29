const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOCAL_PORT = 8799;
const LOCAL_ROOT = path.join(__dirname, '..');

function startServer() {
  return new Promise(resolve => {
    const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
    const server = http.createServer((req, res) => {
      const fp = path.join(LOCAL_ROOT, req.url === '/' ? 'index.html' : req.url);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, {'Content-Type': mime[path.extname(fp)] || 'text/plain'});
        res.end(data);
      });
    });
    server.listen(LOCAL_PORT, () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  // --- LOCAL ---
  const localPage = await browser.newPage();
  await localPage.setViewport({width: 1440, height: 900});
  await localPage.goto('http://localhost:' + LOCAL_PORT + '/blog/index.html', {waitUntil: 'networkidle2', timeout: 10000});
  await new Promise(r => setTimeout(r, 1500));

  const localLayout = await localPage.evaluate(() => {
    function info(sel) {
      const el = document.querySelector(sel);
      if (!el) return { missing: true };
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return {
        top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height),
        paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
        marginTop: s.marginTop, marginBottom: s.marginBottom
      };
    }
    return {
      hero:        info('.blog-hero'),
      listing:     info('.blog-listing'),
      filterBar:   info('.blog-filter-bar'),
      filterRow:   info('.blog-filter__dropdown-row'),
      cardGrid:    info('#blog-card-grid'),
      firstCard:   info('.blog-card')
    };
  });

  // --- LIVE ---
  const livePage = await browser.newPage();
  await livePage.setViewport({width: 1440, height: 900});
  await livePage.goto('https://www.gptechadvisors.com/blog/', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 3000));

  const liveLayout = await livePage.evaluate(() => {
    function info(sel) {
      const el = document.querySelector(sel);
      if (!el) return { missing: true };
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return {
        top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height),
        paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
        marginTop: s.marginTop, marginBottom: s.marginBottom
      };
    }
    // Live selectors
    return {
      hero:        info('.elementor-element-4344754f'),
      filterLabel: info('label'),
      filterSelect: info('select'),
      cardGrid:    info('.elementor-loop-container'),
      firstCard:   info('.e-loop-item')
    };
  });

  // Full page screenshots for visual diff
  await localPage.screenshot({path: path.join(LOCAL_ROOT, 'reference/layout-local.png'), fullPage: true});
  await livePage.screenshot({path: path.join(LOCAL_ROOT, 'reference/layout-live.png'), fullPage: true});

  console.log('\n=== LOCAL LAYOUT ===');
  console.log(JSON.stringify(localLayout, null, 2));
  console.log('\n=== LIVE LAYOUT ===');
  console.log(JSON.stringify(liveLayout, null, 2));

  // Gap analysis
  console.log('\n=== KEY GAPS ===');
  if (!localLayout.filterRow.missing && !localLayout.firstCard.missing) {
    console.log('LOCAL: gap between filter bottom (' + localLayout.filterRow.bottom + ') and first card top (' + localLayout.firstCard.top + '): ' + (localLayout.firstCard.top - localLayout.filterRow.bottom) + 'px');
  }
  if (!liveLayout.filterLabel.missing && !liveLayout.firstCard.missing) {
    console.log('LIVE:  gap between filter bottom (' + (liveLayout.filterLabel.bottom || '?') + ') and first card top (' + liveLayout.firstCard.top + '): ' + (liveLayout.firstCard.top - (liveLayout.filterLabel.bottom || 0)) + 'px');
  }

  await browser.close();
  server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
