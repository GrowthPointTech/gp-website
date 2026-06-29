const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const LOCAL_PORT = 8795;
const LOCAL_ROOT = path.join(__dirname, '..');
function startServer() {
  return new Promise(resolve => {
    const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
    const server = http.createServer((req, res) => {
      const fp = path.join(LOCAL_ROOT, req.url === '/' ? 'index.html' : req.url);
      fs.readFile(fp, (err, data) => { if (err) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, {'Content-Type': mime[path.extname(fp)]||'text/plain'}); res.end(data); });
    });
    server.listen(LOCAL_PORT, () => resolve(server));
  });
}
(async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({headless:true, executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page = await browser.newPage();
  await page.setViewport({width:1440,height:900});
  await page.goto('http://localhost:'+LOCAL_PORT+'/blog/index.html',{waitUntil:'networkidle2',timeout:10000});
  await new Promise(r=>setTimeout(r,1500));
  const cards = await page.evaluate(() => Array.from(document.querySelectorAll('.blog-card')).map((c,i) => { const r=c.getBoundingClientRect(); return {i,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; }));
  // card 4 (index 3) and card 5 (index 4)
  for (const idx of [3, 4]) {
    const c = cards[idx];
    if (c) await page.screenshot({path:path.join(LOCAL_ROOT,'reference','card'+idx+'-local.png'),clip:{x:c.x,y:c.y,width:c.w,height:c.h}});
  }
  await browser.close();
  server.close();
})().catch(e=>console.error(e.message));
