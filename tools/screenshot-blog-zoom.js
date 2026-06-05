const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

function serve(dir, port) {
  return http.createServer(function(req, res) {
    let url = req.url === '/' ? '/index.html' : req.url;
    let fp = path.join(dir, url.split('?')[0]);
    try { res.end(fs.readFileSync(fp)); } catch(e) { res.writeHead(404); res.end(); }
  }).listen(port);
}

(async () => {
  const srv = serve(path.resolve(__dirname, '..'), 8768);
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8768/blog/index.html', { waitUntil: 'networkidle0' });
  // Scroll to bottom to trigger all scroll animations, then back to grid
  await page.evaluate(function() { window.scrollTo(0, document.body.scrollHeight); });
  await new Promise(function(r) { setTimeout(r, 2000); });
  await page.evaluate(function() { window.scrollTo(0, 0); });
  await new Promise(function(r) { setTimeout(r, 500); });
  const cardGrid = await page.$('#blog-card-grid');
  if (cardGrid) {
    await cardGrid.screenshot({ path: path.resolve(__dirname, '../reference/blog-cards-zoom.png') });
    console.log('Card grid screenshot saved');
  }
  // Also first card only
  const firstCard = await page.$('.blog-card');
  if (firstCard) {
    await firstCard.screenshot({ path: path.resolve(__dirname, '../reference/blog-card-first.png') });
    console.log('First card screenshot saved');
  }
  await browser.close();
  srv.close();
})();
