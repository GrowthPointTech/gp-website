#!/usr/bin/env node
/**
 * Compare computed styles between live site and local site.
 *
 * Usage: node tools/compare-styles.js
 *
 * This launches headless Chrome, opens both the live site and a local
 * HTTP server serving our files, extracts computed styles from matching
 * elements, and outputs a diff of every mismatch.
 *
 * Prerequisites: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8765;
const LOCAL_ROOT = path.join(__dirname, '..');

// CSS properties to compare
const PROPERTIES = [
  'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-transform', 'text-decoration',
  'color', 'background-color', 'background-image',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'width', 'max-width', 'min-height',
  'display', 'position', 'text-align',
  'border-radius', 'opacity'
];

// Elements to compare — pairs of [live_selector, local_selector, label]
// Live selectors use Elementor data-id attributes
// Local selectors use our CSS classes
const COMPARISONS = {
  '/': {  // home page
    elements: [
      {
        label: 'hero-eyebrow',
        live: '[data-id="670c781"] .elementor-heading-title',
        local: '.hero__eyebrow'
      },
      {
        label: 'hero-h1',
        live: '[data-id="77ea049"] .elementor-heading-title',
        local: '.hero--home h1'
      },
      {
        label: 'hero-body',
        live: '[data-id="9b64576"] .elementor-widget-container p',
        local: '.hero__content > p:last-of-type'
      },
      {
        label: 'nav-link',
        live: '[data-id="cd7bc42"] .elementor-item',
        local: '.nav__links a'
      },
      {
        label: 'pillars-heading',
        live: '.elementor-widget-heading .elementor-heading-title',
        local: '.pillars-section h2'
      },
      {
        label: 'pillar-title',
        live: '.elementor-icon-box .elementor-icon-box-title',
        local: '.pillar__title'
      },
      {
        label: 'pillar-text',
        live: '.elementor-icon-box .elementor-icon-box-description',
        local: '.pillar__text'
      }
    ]
  }
};

// Simple static file server
function startLocalServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
      '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
      '.woff2': 'font/woff2', '.woff': 'font/woff'
    };

    const server = http.createServer((req, res) => {
      let filePath = path.join(LOCAL_ROOT, req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(LOCAL_PORT, () => {
      console.log(`Local server: http://localhost:${LOCAL_PORT}`);
      resolve(server);
    });
  });
}

async function getComputedStyles(page, selector, properties) {
  return page.evaluate((sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    const result = {};
    for (const prop of props) {
      result[prop] = computed.getPropertyValue(prop);
    }
    result['_tag'] = el.tagName.toLowerCase();
    result['_text'] = el.textContent.trim().substring(0, 60);
    const rect = el.getBoundingClientRect();
    result['_width'] = Math.round(rect.width) + 'px';
    result['_height'] = Math.round(rect.height) + 'px';
    return result;
  }, selector, properties);
}

async function main() {
  const server = await startLocalServer();

  console.log('Launching headless Chrome...\n');
  const browser = await puppeteer.launch({ headless: true });

  const results = {};
  let totalMismatches = 0;

  for (const [pagePath, config] of Object.entries(COMPARISONS)) {
    const liveUrl = LIVE_URL + pagePath;
    const localUrl = `http://localhost:${LOCAL_PORT}${pagePath}`;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`PAGE: ${pagePath}`);
    console.log(`Live:  ${liveUrl}`);
    console.log(`Local: ${localUrl}`);
    console.log('='.repeat(70));

    const livePage = await browser.newPage();
    await livePage.setViewport({ width: 1440, height: 900 });
    await livePage.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const localPage = await browser.newPage();
    await localPage.setViewport({ width: 1440, height: 900 });
    await localPage.goto(localUrl, { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    results[pagePath] = [];

    for (const elem of config.elements) {
      const liveStyles = await getComputedStyles(livePage, elem.live, PROPERTIES);
      const localStyles = await getComputedStyles(localPage, elem.local, PROPERTIES);

      if (!liveStyles) {
        console.log(`\n  ✗ ${elem.label}: LIVE element not found (${elem.live})`);
        continue;
      }
      if (!localStyles) {
        console.log(`\n  ✗ ${elem.label}: LOCAL element not found (${elem.local})`);
        continue;
      }

      const diffs = [];
      for (const prop of PROPERTIES) {
        const liveVal = liveStyles[prop];
        const localVal = localStyles[prop];
        if (liveVal !== localVal) {
          // Skip background-image mismatches on containers (expected to differ)
          if (prop === 'background-image') continue;
          // Skip width differences (layout depends on container)
          if (prop === 'width' || prop === 'max-width') continue;
          diffs.push({ property: prop, live: liveVal, local: localVal });
        }
      }

      const textMatch = liveStyles._text === localStyles._text;

      if (diffs.length === 0 && textMatch) {
        console.log(`\n  ✓ ${elem.label}: MATCH`);
        console.log(`    Text: "${liveStyles._text}"`);
      } else {
        console.log(`\n  ✗ ${elem.label}: ${diffs.length} CSS diff(s)${textMatch ? '' : ' + TEXT MISMATCH'}`);
        console.log(`    Live text:  "${liveStyles._text}"`);
        console.log(`    Local text: "${localStyles._text}"`);
        console.log(`    Live size:  ${liveStyles._width} x ${liveStyles._height}`);
        console.log(`    Local size: ${localStyles._width} x ${localStyles._height}`);

        if (diffs.length > 0) {
          console.log(`    ${'Property'.padEnd(22)} ${'LIVE'.padEnd(35)} LOCAL`);
          console.log(`    ${'─'.repeat(22)} ${'─'.repeat(35)} ${'─'.repeat(35)}`);
          for (const d of diffs) {
            console.log(`    ${d.property.padEnd(22)} ${d.live.padEnd(35)} ${d.local}`);
          }
        }

        totalMismatches += diffs.length;
      }

      results[pagePath].push({
        label: elem.label,
        diffs,
        textMatch,
        liveText: liveStyles._text,
        localText: localStyles._text,
        liveSize: `${liveStyles._width} x ${liveStyles._height}`,
        localSize: `${localStyles._width} x ${localStyles._height}`
      });
    }

    await livePage.close();
    await localPage.close();
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`TOTAL MISMATCHES: ${totalMismatches}`);
  console.log('='.repeat(70));

  // Write results
  const outPath = path.join(__dirname, '..', 'reference', 'style-comparison.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results: ${outPath}`);

  await browser.close();
  server.close();
}

main().catch(e => {
  console.error('Failed:', e);
  process.exit(1);
});
