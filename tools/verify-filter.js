const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOCAL_PORT = 8782;
const LOCAL_ROOT = path.join(__dirname, '..');

function startServer() {
  return new Promise(resolve => {
    const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript',
      '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
    const server = http.createServer((req, res) => {
      const fp = path.join(LOCAL_ROOT, req.url === '/' ? 'index.html' : req.url);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, {'Content-Type': mime[path.extname(fp)] || 'text/plain'});
        res.end(data);
      });
    });
    server.listen(LOCAL_PORT, () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  // Live
  const livePage = await browser.newPage();
  await livePage.setViewport({width: 1440, height: 900});
  await livePage.goto('https://www.gptechadvisors.com/blog/', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 3000));
  await livePage.screenshot({path: path.join(LOCAL_ROOT, 'reference/verify-live.png'), clip: {x:0, y:280, width:900, height:340}});

  const liveData = await livePage.evaluate(() => {
    const label = document.querySelector('label');
    const select = document.querySelector('select');
    if (!label || !select) return null;
    const ls = window.getComputedStyle(label);
    const ss = window.getComputedStyle(select);
    return {
      labelText: label.textContent.trim(),
      labelTop: Math.round(label.getBoundingClientRect().top),
      labelFontSize: ls.fontSize,
      labelFontWeight: ls.fontWeight,
      selectFontSize: ss.fontSize,
      selectTop: Math.round(select.getBoundingClientRect().top)
    };
  });

  // Local
  const localPage = await browser.newPage();
  await localPage.setViewport({width: 1440, height: 900});
  await localPage.goto('http://localhost:' + LOCAL_PORT + '/blog/index.html', {waitUntil: 'networkidle2', timeout: 10000});
  await new Promise(r => setTimeout(r, 1500));
  await localPage.screenshot({path: path.join(LOCAL_ROOT, 'reference/verify-local.png'), clip: {x:0, y:280, width:900, height:340}});

  const localData = await localPage.evaluate(() => {
    const label = document.querySelector('.blog-filter__label');
    const select = document.querySelector('.blog-filter__select');
    if (!label || !select) return null;
    const ls = window.getComputedStyle(label);
    const ss = window.getComputedStyle(select);
    return {
      labelText: label.textContent.trim(),
      labelTop: Math.round(label.getBoundingClientRect().top),
      labelFontSize: ls.fontSize,
      labelFontWeight: ls.fontWeight,
      selectFontSize: ss.fontSize,
      selectTop: Math.round(select.getBoundingClientRect().top)
    };
  });

  console.log('\n--- LIVE ---');
  console.log(JSON.stringify(liveData, null, 2));
  console.log('\n--- LOCAL ---');
  console.log(JSON.stringify(localData, null, 2));

  if (liveData && localData) {
    const topDiff = localData.labelTop - liveData.labelTop;
    console.log('\n--- DIFF ---');
    console.log('Label top offset diff (local - live):', topDiff, 'px');
    console.log('Label font-size: live=' + liveData.labelFontSize + ' local=' + localData.labelFontSize);
    console.log('Select font-size: live=' + liveData.selectFontSize + ' local=' + localData.selectFontSize);
  }

  await browser.close();
  server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
