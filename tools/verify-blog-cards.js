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
  await new Promise(r => setTimeout(r, 1500));

  const data = await page.evaluate(() => {
    document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('is-visible'));
    const s = document.createElement('style');
    s.textContent = '.scroll-animate{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}';
    document.head.appendChild(s);

    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        h: Math.round(r.height), w: Math.round(r.width),
        display: c.display, flexDir: c.flexDirection,
        bg: c.backgroundColor, color: c.color,
        fs: c.fontSize, fw: c.fontWeight,
        borderRadius: c.borderRadius,
      };
    }

    const card        = document.querySelector('.blog-carousel__track .blog-card');
    const imgWrap     = document.querySelector('.blog-card__img-wrap');
    const img         = document.querySelector('.blog-card__img');
    const body        = document.querySelector('.blog-card__body');
    const tag         = document.querySelector('.blog-card__tag');
    const title       = document.querySelector('.blog-card__title');
    const desc        = document.querySelector('.blog-card__desc');
    const link        = document.querySelector('.blog-card__link');
    const arrowPrev   = document.querySelector('.blog-carousel__arrow--prev');
    const arrowNext   = document.querySelector('.blog-carousel__arrow--next');
    const controls    = document.querySelector('.blog-carousel__controls');

    return {
      card:      cs(card),
      imgWrap:   cs(imgWrap),
      img:       cs(img),
      body:      cs(body),
      tag:       cs(tag),
      title:     cs(title),
      desc:      cs(desc),
      link:      cs(link),
      arrowPrev: cs(arrowPrev),
      controls:  cs(controls),
    };
  });

  console.log('\n=== CARD VERIFICATION ===');
  console.log('Card layout:       display=' + data.card?.display + '  flexDir=' + data.card?.flexDir);
  console.log('Card size:         ' + data.card?.w + 'x' + data.card?.h + 'px  borderRadius=' + data.card?.borderRadius);
  console.log('Image wrap:        ' + data.imgWrap?.w + 'x' + data.imgWrap?.h + 'px  display=' + data.imgWrap?.display);
  console.log('Image actual:      ' + data.img?.w + 'x' + data.img?.h + 'px');
  console.log('Body layout:       display=' + data.body?.display + '  flexDir=' + data.body?.flexDir);
  console.log('Tag color:         ' + data.tag?.color + '  bg=' + data.tag?.bg);
  console.log('Title:             ' + data.title?.fs + '  fw=' + data.title?.fw + '  color=' + data.title?.color);
  console.log('Desc:              ' + data.desc?.fs + '  color=' + data.desc?.color);
  console.log('Link color:        ' + data.link?.color);
  console.log('\nArrow bg:          ' + data.arrowPrev?.bg + '  size=' + data.arrowPrev?.w + 'x' + data.arrowPrev?.h);
  console.log('Controls:          display=' + data.controls?.display);

  // Checks
  const checks = [
    ['Card is flex row',        data.card?.display === 'flex' && data.card?.flexDir === 'row'],
    ['Image is on left (wide)', (data.imgWrap?.w || 0) > 300],
    ['Body is flex column',     data.body?.flexDir === 'column'],
    ['Arrow is black/dark',     (data.arrowPrev?.bg || '').includes('8, 15, 31') || (data.arrowPrev?.bg || '').includes('0, 0, 0')],
    ['Arrow is round',          (data.arrowPrev?.borderRadius || '').includes('50%') || (data.arrowPrev?.h === data.arrowPrev?.w)],
    ['Controls below (block)',  !!data.controls],
  ];

  console.log('\n=== CHECKS ===');
  checks.forEach(([name, pass]) => console.log((pass ? '  ✓' : '  ✗') + ' ' + name));

  await page.screenshot({ path: 'reference/blog-cards-verify.png' });
  await browser.close();
  srv.close();
}
main().catch(console.error);
