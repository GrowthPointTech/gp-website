#!/usr/bin/env node
/**
 * Extract computed styles from the live GrowthPoint website using Puppeteer.
 *
 * Usage: node tools/extract-styles.js
 * Output: reference/computed-styles.json
 *
 * This launches a headless Chrome, navigates to the live site, waits for
 * Elementor JS to render, then calls getComputedStyle() on every element
 * we care about. The result is the exact CSS the browser computes — no
 * guessing at Elementor variable mappings.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://www.gptechadvisors.com';

// CSS properties we care about for each element
const PROPERTIES = [
  'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-transform', 'text-decoration',
  'color', 'background-color', 'background-image',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'width', 'max-width', 'min-height',
  'display', 'position', 'text-align',
  'border-radius', 'box-shadow', 'opacity',
  'gap', 'row-gap', 'column-gap'
];

// Elements to extract — selector + label
// Uses the Elementor data-id attributes from the cached live HTML
const ELEMENTS = {
  home: {
    url: '/',
    selectors: {
      // Hero section
      'hero-container': '[data-id="6801208"]',
      'hero-eyebrow': '[data-id="670c781"] .elementor-heading-title',
      'hero-h1': '[data-id="77ea049"] .elementor-heading-title',
      'hero-body': '[data-id="9b64576"] .elementor-widget-container p',
      'hero-inner-container': '[data-id="6b1b81a"]',
      // Nav
      'nav-container': '[data-id="43d5d85"]',
      'nav-logo': '[data-id="43b3740"] img',
      'nav-link': '[data-id="cd7bc42"] .elementor-item',
      'nav-contact-btn': '[data-id="77e69cb"] .elementor-button',
      // Pillars section
      'pillars-container': '[data-id="9c99b3f"]',
      'pillars-heading': '[data-id="a3c9176"] .elementor-heading-title',
      'pillars-intro': '[data-id="3a60c65"] p',
      'pillar-icon-container': '[data-id="51c480a"]',
      'pillar-name': '[data-id="3e18276"] .elementor-heading-title',
      'pillar-slide-heading': '.elementor-slide-heading',
      'pillar-slide-description': '.elementor-slide-description',
      'pillar-slider-container': '[data-id="c0088ab"]',
      // Footer
      'footer-container': 'footer, [data-elementor-type="footer"]',
    }
  },
  services: {
    url: '/services/',
    selectors: {
      'services-hero-eyebrow': '.elementor-element-10a611e3 .elementor-heading-title',
      'services-hero-h1': '.elementor-element-5bee61d0',
      'services-intro-heading': '.elementor-element-966222b, [class*="heading-title"]',
    }
  }
};

async function extractStyles(page, selectors) {
  const results = {};

  for (const [label, selector] of Object.entries(selectors)) {
    try {
      const styles = await page.evaluate((sel, props) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const computed = window.getComputedStyle(el);
        const result = {};
        for (const prop of props) {
          result[prop] = computed.getPropertyValue(prop);
        }
        // Also get the element's bounding box
        const rect = el.getBoundingClientRect();
        result['_bounding-width'] = Math.round(rect.width) + 'px';
        result['_bounding-height'] = Math.round(rect.height) + 'px';
        result['_tag'] = el.tagName.toLowerCase();
        result['_text-preview'] = el.textContent.trim().substring(0, 80);
        return result;
      }, selector, PROPERTIES);

      results[label] = styles || { _error: `Element not found: ${selector}` };
    } catch (e) {
      results[label] = { _error: e.message };
    }
  }

  return results;
}

async function main() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({ headless: true });

  const allResults = {};

  for (const [pageName, config] of Object.entries(ELEMENTS)) {
    const url = LIVE_URL + config.url;
    console.log(`\nExtracting: ${pageName} (${url})`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a beat for Elementor animations/JS to settle
    await new Promise(r => setTimeout(r, 2000));

    allResults[pageName] = await extractStyles(page, config.selectors);

    // Log summary
    for (const [label, styles] of Object.entries(allResults[pageName])) {
      if (styles._error) {
        console.log(`  ✗ ${label}: ${styles._error}`);
      } else {
        console.log(`  ✓ ${label}: ${styles['font-family']?.substring(0, 30)} ${styles['font-size']} / ${styles['font-weight']} / ${styles['color']}`);
      }
    }

    await page.close();
  }

  // Write results
  const outPath = path.join(__dirname, '..', 'reference', 'computed-styles.json');
  fs.writeFileSync(outPath, JSON.stringify(allResults, null, 2));
  console.log(`\nWritten to: ${outPath}`);

  await browser.close();
}

main().catch(e => {
  console.error('Failed:', e);
  process.exit(1);
});
