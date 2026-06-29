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

async function shoot(browser, url, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: `reference/footer-compare-${label}.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } });

  const stats = await page.evaluate(() => {
    function cs(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), pt: c.paddingTop, pb: c.paddingBottom, mt: c.marginTop };
    }
    return {
      footer:       cs('footer, .footer'),
      footerMain:   cs('.footer__main, .elementor-location-footer .e-con-boxed'),
      footerBottom: cs('.footer__bottom'),
      logo:         cs('.footer__logo img'),
    };
  });

  console.log(label, JSON.stringify(stats, null, 2));
  await page.close();
}

async function main() {
  const srv = await startServer(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  await shoot(browser, 'https://www.gptechadvisors.com', 'live');
  await shoot(browser, 'http://localhost:8765', 'local');
  await browser.close();
  srv.close();
}
main().catch(console.error);
