/**
 * Captures cropped screenshots of the filter/header area of the blog page
 * - Live site: https://www.gptechadvisors.com/blog/
 * - Local site: http://localhost:8767/blog/index.html
 * Saves to reference/filter-live-zoom.png and reference/filter-local-zoom.png
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.resolve(__dirname, '..');
const REFERENCE_DIR = path.join(SITE_ROOT, 'reference');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_PORT = 8767;
const CLIP = { x: 0, y: 380, width: 1440, height: 250 };

// Simple static file server
function startServer(root, port) {
  return new Promise((resolve, reject) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.json': 'application/json',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };

    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

      const filePath = path.join(root, urlPath);
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found: ' + urlPath);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`Static server running at http://localhost:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function screenshot(page, url, waitMs, outFile) {
  console.log(`Navigating to ${url} ...`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log(`  Waiting ${waitMs}ms ...`);
  await new Promise(r => setTimeout(r, waitMs));
  await page.screenshot({
    path: outFile,
    clip: CLIP,
  });
  console.log(`  Saved: ${outFile}`);
}

(async () => {
  // Ensure reference dir exists
  if (!fs.existsSync(REFERENCE_DIR)) fs.mkdirSync(REFERENCE_DIR, { recursive: true });

  const server = await startServer(SITE_ROOT, LOCAL_PORT);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    // --- Live site ---
    const livePage = await browser.newPage();
    await screenshot(
      livePage,
      'https://www.gptechadvisors.com/blog/',
      3000,
      path.join(REFERENCE_DIR, 'filter-live-zoom.png')
    );
    await livePage.close();

    // --- Local site ---
    const localPage = await browser.newPage();
    await screenshot(
      localPage,
      `http://localhost:${LOCAL_PORT}/blog/index.html`,
      2000,
      path.join(REFERENCE_DIR, 'filter-local-zoom.png')
    );
    await localPage.close();

  } finally {
    await browser.close();
    server.close(() => console.log('Static server stopped.'));
  }

  console.log('\nDone. Both screenshots saved to reference/');
})();
