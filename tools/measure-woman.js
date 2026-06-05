const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const root = path.join(__dirname, '..');
  const srv = http.createServer((req, res) => {
    const fp = path.join(root, decodeURIComponent(req.url === '/' ? 'index.html' : req.url.split('?')[0]));
    if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
    const t = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
    res.writeHead(200, {'Content-Type': t[path.extname(fp)] || 'text/plain'});
    fs.createReadStream(fp).pipe(res);
  });
  await new Promise(r => srv.listen(8765, r));

  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  const data = await page.evaluate(() => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    // Kill animations so we measure final resting positions, not initial animation frames
    const style = document.createElement('style');
    style.textContent = '* { animation: none !important; transition: none !important; transform: none !important; }';
    document.head.appendChild(style);
    const section  = document.querySelector('.services-overview');
    const photo    = document.querySelector('.services-overview__photo');
    const img      = document.querySelector('.services-overview__photo img');
    const inner    = document.querySelector('.services-overview__inner');
    const sr = section?.getBoundingClientRect();
    const pr = photo?.getBoundingClientRect();
    const ir = img?.getBoundingClientRect();
    const inr = inner?.getBoundingClientRect();
    return {
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      section:  sr  ? { top: Math.round(sr.top),  bottom: Math.round(sr.bottom),  h: Math.round(sr.height),  w: Math.round(sr.width), left: Math.round(sr.left), right: Math.round(sr.right) } : null,
      photo:    pr  ? { top: Math.round(pr.top),  bottom: Math.round(pr.bottom),  h: Math.round(pr.height),  w: Math.round(pr.width), left: Math.round(pr.left), right: Math.round(pr.right) } : null,
      img:      ir  ? { top: Math.round(ir.top),  bottom: Math.round(ir.bottom),  h: Math.round(ir.height),  w: Math.round(ir.width), left: Math.round(ir.left) } : null,
      inner:    inr ? { h: Math.round(inr.height) } : null,
    };
  });

  console.log('Section:', JSON.stringify(data.section));
  console.log('Photo container:', JSON.stringify(data.photo));
  console.log('Image:', JSON.stringify(data.img));
  console.log('Inner:', JSON.stringify(data.inner));
  console.log('\nImage bottom vs section bottom:', data.img?.bottom, 'vs', data.section?.bottom,
    '→', (data.img?.bottom ?? 0) - (data.section?.bottom ?? 0), 'px diff');
  console.log('Image top vs section top:', data.img?.top, 'vs', data.section?.top,
    '→', (data.section?.top ?? 0) - (data.img?.top ?? 0), 'px above section');

  await browser.close();
  srv.close();
}
main().catch(console.error);
