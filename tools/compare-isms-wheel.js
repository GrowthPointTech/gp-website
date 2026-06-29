/**
 * compare-isms-wheel.js
 * Screenshots and style-extracts the ISMS wheel from:
 *   - Live production: https://gptechadvisors.com/services/ciso
 *   - Local preview:   http://localhost:3000/services/ciso.html
 * Outputs screenshots + a diff summary to reference/
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'reference');

function startServer(port) {
  return new Promise(resolve => {
    const mime = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
                   '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp',
                   '.woff2':'font/woff2' };
    const s = http.createServer((req, res) => {
      const fp = path.join(ROOT, req.url.split('?')[0]);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'text/plain' });
      fs.createReadStream(fp).pipe(res);
    });
    s.listen(port, () => resolve(s));
  });
}

async function extractWheelData(page, label) {
  // Wait for the ISMS wheel SVG to render
  await page.waitForSelector('#isms-wheel svg, .isms-wheel svg, [aria-label*="ISMS"], img[src*="isms"]', { timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  const data = await page.evaluate(() => {
    // Try JS-rendered SVG wheel
    const wheelEl = document.getElementById('isms-wheel') || document.querySelector('.isms-wheel');
    const svg = wheelEl?.querySelector('svg');

    // Try PNG image (live Elementor site)
    const img = document.querySelector('img[src*="isms"], img[alt*="isms"], img[alt*="ISMS"]');

    // Section container
    const section = document.querySelector('.isms-section, section[class*="isms"]') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('ISMS'))?.closest('section');

    const sectionRect = section?.getBoundingClientRect();
    const sectionStyles = section ? getComputedStyle(section) : null;

    // Heading text
    const heading = document.querySelector('.isms-section h2, .isms-section__heading h2');

    // Intro paragraph
    const intro = document.querySelector('.isms-section__intro, .isms-section p');

    // SVG segments (preview)
    const paths = svg ? Array.from(svg.querySelectorAll('path')).map(p => ({
      fill: p.getAttribute('fill'),
      d: p.getAttribute('d')?.substring(0, 60) + '…',
    })) : [];

    // SVG texts (preview)
    const labels = svg ? Array.from(svg.querySelectorAll('text')).map(t => t.textContent) : [];

    // Center circle
    const centerCircle = svg ? (() => {
      const c = svg.querySelector('circle');
      return c ? { r: c.getAttribute('r'), fill: c.getAttribute('fill') } : null;
    })() : null;

    // viewBox
    const viewBox = svg?.getAttribute('viewBox');

    return {
      hasJSSvg: !!svg,
      hasPngImage: !!img,
      imgSrc: img?.src || null,
      segmentCount: paths.length,
      segmentColors: paths.map(p => p.fill),
      svgLabels: labels,
      viewBox,
      centerCircle,
      sectionBg: sectionStyles?.backgroundColor,
      sectionW: sectionRect ? Math.round(sectionRect.width) : null,
      sectionH: sectionRect ? Math.round(sectionRect.height) : null,
      headingText: heading?.textContent?.trim(),
      introText: intro?.textContent?.trim()?.substring(0, 100) + '…',
    };
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}`);
  console.log('='.repeat(60));
  console.log('Has JS SVG wheel:  ', data.hasJSSvg);
  console.log('Has PNG image:     ', data.hasPngImage);
  if (data.hasPngImage) console.log('  Image src:      ', data.imgSrc);
  console.log('Segment count:     ', data.segmentCount);
  console.log('Segment colors:    ', data.segmentColors);
  console.log('SVG viewBox:       ', data.viewBox);
  console.log('Center circle:     ', data.centerCircle);
  console.log('Section BG:        ', data.sectionBg);
  console.log('Section size:      ', data.sectionW, 'x', data.sectionH);
  console.log('Heading:           ', data.headingText);
  console.log('Labels:            ', data.svgLabels.join(' | '));

  return data;
}

async function screenshotSection(page, label, filename) {
  // Scroll to ISMS section
  await page.evaluate(() => {
    const el = document.querySelector('#isms-wheel, .isms-section, .isms-wheel') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('ISMS'))?.closest('section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Clip to section
  const clip = await page.evaluate(() => {
    const el = document.querySelector('.isms-section, .isms-section--services') ||
      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('ISMS'))?.closest('section');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.width, height: Math.min(r.height, 900) };
  });

  const shotPath = path.join(OUT, filename);
  if (clip) {
    await page.screenshot({ path: shotPath, clip });
  } else {
    await page.screenshot({ path: shotPath, fullPage: false });
  }
  console.log(`Screenshot saved: ${filename}`);
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const server = await startServer(3000);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  try {
    // ── Live production ────────────────────────────────────────────────────
    const livePage = await browser.newPage();
    await livePage.setViewport({ width: 1440, height: 900 });

    // Try the direct CISO URL, fall back to /services/
    let liveUrl = 'https://gptechadvisors.com/services/ciso';
    try {
      const resp = await livePage.goto(liveUrl, { waitUntil: 'networkidle0', timeout: 20000 });
      if (!resp || resp.status() >= 400) {
        liveUrl = 'https://gptechadvisors.com/services/';
        await livePage.goto(liveUrl, { waitUntil: 'networkidle0', timeout: 20000 });
      }
    } catch(e) {
      liveUrl = 'https://gptechadvisors.com/services/';
      await livePage.goto(liveUrl, { waitUntil: 'networkidle0', timeout: 20000 });
    }
    console.log('Live URL:', liveUrl);
    await new Promise(r => setTimeout(r, 3000)); // let Elementor settle

    const liveData = await extractWheelData(livePage, 'LIVE PRODUCTION (' + liveUrl + ')');
    await screenshotSection(livePage, 'live', 'isms-wheel-LIVE.png');

    // ── Local preview ──────────────────────────────────────────────────────
    const localPage = await browser.newPage();
    await localPage.setViewport({ width: 1440, height: 900 });
    await localPage.goto('http://localhost:3000/services/ciso.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    const localData = await extractWheelData(localPage, 'LOCAL PREVIEW (localhost:3000/services/ciso.html)');
    await screenshotSection(localPage, 'local', 'isms-wheel-LOCAL.png');

    // ── Diff summary ───────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('DIFF SUMMARY');
    console.log('='.repeat(60));

    console.log('\nRenderer:');
    console.log('  Live:  ', liveData.hasPngImage ? 'PNG image (Elementor)' : 'JS SVG');
    console.log('  Local: ', localData.hasJSSvg ? 'JS SVG' : 'unknown');

    if (liveData.segmentColors.length || localData.segmentColors.length) {
      console.log('\nColors (live vs local):');
      const maxLen = Math.max(liveData.segmentColors.length, localData.segmentColors.length);
      for (let i = 0; i < maxLen; i++) {
        const lc = liveData.segmentColors[i] || '(none)';
        const rc = localData.segmentColors[i] || '(none)';
        const match = lc.toLowerCase() === rc.toLowerCase() ? '✓' : '✗';
        console.log(`  [${i}] ${match}  live: ${lc}  local: ${rc}`);
      }
    }

    console.log('\nSection dimensions:');
    console.log('  Live:  ', liveData.sectionW, 'x', liveData.sectionH);
    console.log('  Local: ', localData.sectionW, 'x', localData.sectionH);

    const diffReport = { live: liveData, local: localData, generatedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(OUT, 'isms-wheel-diff.json'), JSON.stringify(diffReport, null, 2));
    console.log('\nFull diff written to reference/isms-wheel-diff.json');
    console.log('Screenshots: reference/isms-wheel-LIVE.png, reference/isms-wheel-LOCAL.png');

  } finally {
    await browser.close();
    server.close();
  }
})();
