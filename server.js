const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

const ROOT = __dirname;

http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url.split('?')[0]);
  if (filePath.endsWith('/') || !path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    });
    res.end(data);
  });
}).listen(3000, () => console.log('Serving on http://localhost:3000 (no-cache)'));
