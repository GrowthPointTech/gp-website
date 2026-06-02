#!/usr/bin/env node
/**
 * Extract all content and computed styles from the live about page.
 * Saves to reference/about-live.json for use in content matching and compare-styles.
 *
 * Usage: node tools/extract-about.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://www.gptechadvisors.com/about/';

const STYLE_PROPS = [
  'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-transform', 'text-decoration',
  'color', 'background-color',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-bottom',
  'display', 'text-align'
];

async function main() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log(`Navigating to ${LIVE_URL}...`);
  await page.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // ── 1. Extract full text content section by section ──────────────────────
  const content = await page.evaluate(() => {
    const sections = [];

    // Walk every block-level element that has visible text
    const candidates = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, blockquote, ' +
      '.elementor-heading-title, .elementor-text-editor, ' +
      '[class*="eyebrow"], [class*="subtitle"], ' +
      'a.elementor-button, .elementor-button-text'
    );

    candidates.forEach(el => {
      const text = el.textContent.trim();
      if (!text || text.length < 3) return;

      // Skip nav / footer noise
      const inNav = el.closest('header, nav, .elementor-location-header');
      const inFooter = el.closest('footer, .elementor-location-footer');
      if (inNav || inFooter) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const computed = window.getComputedStyle(el);

      sections.push({
        tag: el.tagName.toLowerCase(),
        text: text.substring(0, 400),
        fontSize: computed.getPropertyValue('font-size'),
        fontWeight: computed.getPropertyValue('font-weight'),
        color: computed.getPropertyValue('color'),
        dataId: el.closest('[data-id]') ? el.closest('[data-id]').getAttribute('data-id') : null,
        selector: el.className ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase()
      });
    });

    return sections;
  });

  // ── 2. Extract Elementor data-id structure ────────────────────────────────
  const elementorIds = await page.evaluate(() => {
    const elements = [];
    document.querySelectorAll('[data-id]').forEach(el => {
      const text = el.textContent.trim().substring(0, 80);
      if (!text) return;
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.height < 5) return;
      elements.push({
        dataId: el.getAttribute('data-id'),
        tag: el.tagName.toLowerCase(),
        classes: el.className.substring(0, 80),
        textPreview: text,
        fontSize: computed.getPropertyValue('font-size'),
        fontWeight: computed.getPropertyValue('font-weight'),
        color: computed.getPropertyValue('color'),
        y: Math.round(rect.y)
      });
    });
    // Sort by vertical position
    return elements.sort((a, b) => a.y - b.y);
  });

  // ── 3. Extract computed styles for likely key elements ────────────────────
  const keySelectors = {
    'about-hero-eyebrow':    '.elementor-location-single h2, [data-id] .elementor-heading-title:first-of-type',
    'about-hero-h1':         'h1.elementor-heading-title, h1',
    'about-hero-body':       '.elementor-widget-text-editor p:first-of-type',
    'about-section-heading': 'h2.elementor-heading-title',
    'about-body-text':       '.elementor-widget-text-editor p',
    'about-cta-button':      '.elementor-button',
    'about-eyebrow-any':     '[data-id] .elementor-heading-title',
  };

  const computedStyles = {};
  for (const [label, selector] of Object.entries(keySelectors)) {
    const styles = await page.evaluate((sel, props) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      const result = { _tag: el.tagName.toLowerCase(), _text: el.textContent.trim().substring(0, 80) };
      for (const p of props) result[p] = computed.getPropertyValue(p);
      return result;
    }, selector, STYLE_PROPS);
    computedStyles[label] = styles || { _error: `not found: ${selector}` };
  }

  const output = { url: LIVE_URL, content, elementorIds, computedStyles };

  const outPath = path.join(__dirname, '..', 'reference', 'about-live.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\nExtracted ${content.length} content elements`);
  console.log(`Extracted ${elementorIds.length} Elementor elements`);
  console.log('\n── TEXT CONTENT ────────────────────────────────────────────');
  content.forEach(c => {
    console.log(`  [${c.tag}] ${c.fontSize} / ${c.fontWeight}  →  "${c.text.substring(0, 100)}"`);
  });
  console.log(`\nSaved: ${outPath}`);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
