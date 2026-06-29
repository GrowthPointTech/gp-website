const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function serve(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let url = req.url.split('?')[0];
      let filePath = path.join(dir, url === '/' ? 'index.html' : url);
      if (!path.extname(filePath)) filePath += '.html';
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath);
        const types = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.json': 'application/json',
          '.woff2': 'font/woff2',
          '.woff': 'font/woff',
          '.ttf': 'font/ttf',
        };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(port, () => resolve(server));
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  // Screenshot live blog
  console.log('Navigating to live blog...');
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1440, height: 900 });
  await page1.goto('https://www.gptechadvisors.com/blog/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page1.screenshot({ path: 'reference/screenshot-live-blog.png', fullPage: true });
  console.log('Live blog screenshot saved to reference/screenshot-live-blog.png');
  await page1.close();

  // Start local server
  const server = await serve('C:\\Users\\joshu\\Documents\\gp-website', 8766);
  console.log('Local server started on port 8766');

  // Screenshot local blog
  console.log('Navigating to local blog...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1440, height: 900 });
  await page2.goto('http://localhost:8766/blog/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await page2.screenshot({ path: 'reference/screenshot-local-blog.png', fullPage: true });
  console.log('Local blog screenshot saved to reference/screenshot-local-blog.png');
  await page2.close();

  await browser.close();
  server.close();
  console.log('Done');
})().catch(e => { console.error(e); process.exit(1); });
