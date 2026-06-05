const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function srv(port) {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const fp = path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      const t = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
      res.writeHead(200, {'Content-Type': t[path.extname(fp)] || 'text/plain'});
      fs.createReadStream(fp).pipe(res);
    });
    s.listen(port, () => resolve(s));
  });
}

async function measure(browser, url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  const d = await page.evaluate(() => {
    function left(sel) {
      const el = document.querySelector(sel);
      return el ? Math.round(el.getBoundingClientRect().left) : null;
    }
    // Try local selectors first, fall back to generic
    return {
      eyebrow: left('.hero--home .hero__eyebrow') || left('h1'),
      h1:      left('.hero--home h1') || left('h1'),
      container: left('.hero--home .container') || left('.container'),
    };
  });
  await page.close();
  return d;
}

async function main() {
  const server = await srv(8765);
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const live  = await measure(browser, 'https://www.gptechadvisors.com');
  const local = await measure(browser, 'http://localhost:8765');
  await browser.close();
  server.close();
  console.log('Live  — container left:', live.container,  '| eyebrow left:', live.eyebrow,  '| h1 left:', live.h1);
  console.log('Local — container left:', local.container, '| eyebrow left:', local.eyebrow, '| h1 left:', local.h1);
  const diff = (local.eyebrow || local.h1) - (live.eyebrow || live.h1);
  console.log('Local text is', diff > 0 ? diff+'px too far RIGHT' : Math.abs(diff)+'px too far LEFT');
}
main().catch(console.error);
