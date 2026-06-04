#!/usr/bin/env node
/**
 * Capture a clipped screenshot of the blog filter row.
 * Starts a local static server on port 8770, opens blog/index.html,
 * waits 2s, then saves a clip to reference/filter-verify.png.
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8770;
const CLIP = { x: 0, y: 350, width: 800, height: 280 };
const OUT  = path.join(ROOT, 'reference', 'filter-verify.png');

// Minimal static file server
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
    '.woff':  'font/woff',
  };

  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    const filePath = path.join(ROOT, urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found: ' + urlPath);
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Static server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

(async () => {
  const server = await startServer();

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}/blog/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({
      path: OUT,
      clip: CLIP,
    });

    console.log(`Screenshot saved to ${OUT}`);

    // Also dump the text content of the filter row area for reporting
    const filterHTML = await page.evaluate(() => {
      // Try common selectors for a filter row
      const candidates = [
        '.blog-filter',
        '.filter-row',
        '.filter-bar',
        '[class*="filter"]',
        'form',
        '.search-bar',
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) return { selector: sel, outerHTML: el.outerHTML.slice(0, 2000) };
      }
      // Fallback: grab visible content around y=350
      return { selector: 'body (fallback)', outerHTML: document.body.innerHTML.slice(0, 3000) };
    });

    console.log('\n--- Filter row element ---');
    console.log('Matched selector:', filterHTML.selector);
    console.log('HTML snippet:\n', filterHTML.outerHTML);

  } finally {
    await browser.close();
    server.close();
  }
})();
