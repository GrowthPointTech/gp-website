const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

function serve(dir, port) {
  return new Promise(function(resolve) {
    const s = http.createServer(function(req, res) {
      const url = req.url.split('?')[0];
      const fp = path.join(dir, url === '/' ? 'index.html' : url);
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
      fs.readFile(fp, function(err, data) {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': types[path.extname(fp)] || 'text/plain' });
        res.end(data);
      });
    }).listen(port, function() { resolve(s); });
  });
}

(async () => {
  const srv = await serve('C:/Users/joshu/Documents/gp-website', 8774);
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8774/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(function() { window.scrollTo(0, document.body.scrollHeight); });
  await new Promise(function(r) { setTimeout(r, 1500); });
  const carousel = await page.$('.blog-carousel');
  if (carousel) {
    await carousel.screenshot({ path: path.resolve(__dirname, '../reference/home-carousel-check.png') });
    console.log('Home carousel screenshot saved');
  } else {
    console.log('No carousel found');
  }
  await browser.close();
  srv.close();
})().catch(function(e) { console.error(e); process.exit(1); });
