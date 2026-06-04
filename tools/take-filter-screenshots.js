const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server
function startStaticServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };

    const server = http.createServer((req, res) => {
      let filePath = path.join(rootDir, req.url.split('?')[0]);
      if (filePath.endsWith('/')) filePath += 'index.html';

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found: ' + req.url);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(port, () => {
      console.log(`Static server running on http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', reject);
  });
}

(async () => {
  const projectRoot = 'C:\\Users\\joshu\\Documents\\gp-website';
  const clip = { x: 0, y: 350, width: 800, height: 280 };

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // --- Screenshot 1: Live site ---
  console.log('Taking screenshot 1: live site blog...');
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1440, height: 900 });
  await page1.goto('https://www.gptechadvisors.com/blog/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page1.screenshot({
    path: path.join(projectRoot, 'reference', 'check-live-filter.png'),
    clip,
  });
  console.log('Saved reference/check-live-filter.png');
  await page1.close();

  // --- Start static server ---
  const server = await startStaticServer(projectRoot, 8769);

  // --- Screenshot 2: Local site ---
  console.log('Taking screenshot 2: local site blog...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1440, height: 900 });
  await page2.goto('http://localhost:8769/blog/index.html', { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page2.screenshot({
    path: path.join(projectRoot, 'reference', 'check-local-filter.png'),
    clip,
  });
  console.log('Saved reference/check-local-filter.png');
  await page2.close();

  await browser.close();
  server.close();
  console.log('Done.');
})();
