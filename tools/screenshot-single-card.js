const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOCAL_PORT = 8793;
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

  // Live — first card only
  const livePage = await browser.newPage();
  await livePage.setViewport({width: 1440, height: 900});
  await livePage.goto('https://www.gptechadvisors.com/blog/', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 3000));

  const liveCardRect = await livePage.evaluate(() => {
    const card = document.querySelector('.e-loop-item');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
  });
  console.log('Live card rect:', liveCardRect);
  if (liveCardRect) {
    await livePage.screenshot({path: path.join(LOCAL_ROOT, 'reference/single-card-live.png'), clip: liveCardRect});
  }

  // Local — first card only
  const localPage = await browser.newPage();
  await localPage.setViewport({width: 1440, height: 900});
  await localPage.goto('http://localhost:' + LOCAL_PORT + '/blog/index.html', {waitUntil: 'networkidle2', timeout: 10000});
  await new Promise(r => setTimeout(r, 1500));

  const localCardRect = await localPage.evaluate(() => {
    const card = document.querySelector('.blog-card');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
  });
  console.log('Local card rect:', localCardRect);
  if (localCardRect) {
    await localPage.screenshot({path: path.join(LOCAL_ROOT, 'reference/single-card-local.png'), clip: localCardRect});
  }

  await browser.close();
  server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
