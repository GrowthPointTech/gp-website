const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOCAL_PORT = 8798;
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

  async function footerShot(url, outFile) {
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    await new Promise(r => setTimeout(r, 1500));
    const rect = await page.evaluate(() => {
      const el = document.querySelector('.footer');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {x: 0, y: Math.round(r.y), width: 1440, height: Math.round(r.height)};
    });
    if (rect) await page.screenshot({path: outFile, clip: rect});
    await page.close();
    return rect;
  }

  const aboutRect  = await footerShot('http://localhost:' + LOCAL_PORT + '/about.html',      path.join(LOCAL_ROOT, 'reference/footer-about.png'));
  const blogRect   = await footerShot('http://localhost:' + LOCAL_PORT + '/blog/index.html', path.join(LOCAL_ROOT, 'reference/footer-blog.png'));

  console.log('About footer height:', aboutRect && aboutRect.height);
  console.log('Blog  footer height:', blogRect  && blogRect.height);

  await browser.close();
  server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
