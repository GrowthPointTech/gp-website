const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOCAL_PORT = 8794;
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

  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  await page.goto('http://localhost:' + LOCAL_PORT + '/blog/index.html', {waitUntil: 'networkidle2', timeout: 10000});
  await new Promise(r => setTimeout(r, 1500));

  // Get local card category data
  const cardData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.blog-card')).map(card => {
      const tags = Array.from(card.querySelectorAll('.card__tag')).map(t => t.textContent.trim());
      const title = card.querySelector('.card__title');
      return {
        title: title ? title.textContent.trim().substring(0, 50) : '?',
        categories: tags
      };
    });
  });

  console.log('Local card categories:');
  cardData.forEach(c => console.log(' ', JSON.stringify(c.categories), '|', c.title));

  // Screenshot first row
  await page.screenshot({
    path: path.join(LOCAL_ROOT, 'reference', 'all-cards-local.png'),
    clip: {x: 60, y: 650, width: 1320, height: 800}
  });

  // Screenshot single card (post 2 with multiple badges)
  const card2Rect = await page.evaluate(() => {
    const cards = document.querySelectorAll('.blog-card');
    if (cards.length < 2) return null;
    const r = cards[1].getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
  });
  if (card2Rect) {
    await page.screenshot({path: path.join(LOCAL_ROOT, 'reference', 'card2-local.png'), clip: card2Rect});
    console.log('Card 2 rect:', card2Rect);
  }

  await browser.close();
  server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
