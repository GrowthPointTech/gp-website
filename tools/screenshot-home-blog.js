const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

function serve(dir, port) {
  return new Promise(function(resolve) {
    const s = http.createServer(function(req, res) {
      const fp = path.join(dir, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
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
  const srv = await serve('C:/Users/joshu/Documents/gp-website', 8775);
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox'], headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8775/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(function() { window.scrollTo(0, document.body.scrollHeight); });
  await new Promise(function(r) { setTimeout(r, 2000); });

  // Screenshot the blog highlights section
  const section = await page.$('.blog-highlights');
  if (section) {
    await section.screenshot({ path: path.resolve(__dirname, '../reference/home-blog-section.png') });
    console.log('Blog highlights section saved');
  }

  // Measure first carousel card
  const stats = await page.evaluate(function() {
    const card = document.querySelector('.blog-carousel__track .blog-card');
    if (!card) return { error: 'no card' };
    const s = getComputedStyle(card);
    const r = card.getBoundingClientRect();
    const img = card.querySelector('.blog-card__img-wrap');
    const imgS = img ? getComputedStyle(img) : null;
    const imgR = img ? img.getBoundingClientRect() : null;
    return {
      cardH: Math.round(r.height),
      cardW: Math.round(r.width),
      bg: s.backgroundColor,
      radius: s.borderRadius,
      display: s.display,
      flexDir: s.flexDirection,
      imgH: imgR ? Math.round(imgR.height) : 0,
      imgDisplay: imgS ? imgS.display : '',
    };
  });
  console.log('Carousel card:', JSON.stringify(stats, null, 2));

  await browser.close();
  srv.close();
})().catch(function(e) { console.error(e); process.exit(1); });
