const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOCAL_PORT = 8797;
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

  // Local blog footer
  const localPage = await browser.newPage();
  await localPage.setViewport({width: 1440, height: 900});
  await localPage.goto('http://localhost:' + LOCAL_PORT + '/blog/index.html', {waitUntil: 'networkidle2', timeout: 10000});
  await new Promise(r => setTimeout(r, 1500));

  const footerRect = await localPage.evaluate(() => {
    const el = document.querySelector('.footer');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
  });
  console.log('Footer rect:', footerRect);
  if (footerRect) {
    await localPage.screenshot({path: path.join(LOCAL_ROOT, 'reference', 'footer-blog-local.png'), clip: {x: 0, y: footerRect.y, width: 1440, height: footerRect.height}});
  }

  // Live blog footer
  const livePage = await browser.newPage();
  await livePage.setViewport({width: 1440, height: 900});
  await livePage.goto('https://www.gptechadvisors.com/blog/', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 3000));

  const liveFooterRect = await livePage.evaluate(() => {
    const el = document.querySelector('footer');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
  });
  console.log('Live footer rect:', liveFooterRect);
  if (liveFooterRect) {
    await livePage.screenshot({path: path.join(LOCAL_ROOT, 'reference', 'footer-blog-live.png'), clip: {x: 0, y: liveFooterRect.y, width: 1440, height: liveFooterRect.height}});
  }

  await browser.close();
  server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
