#!/usr/bin/env node
/**
 * Extract exact computed styles from the live services page hero section.
 * Captures background-image URL, all spacing, typography, and layout values.
 */

const puppeteer = require('puppeteer');

const LIVE_URL = 'https://www.gptechadvisors.com/services/';

const PROPERTIES = [
  'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-transform', 'text-decoration',
  'color', 'background-color', 'background-image', 'background-size',
  'background-position', 'background-repeat', 'background-blend-mode',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'width', 'max-width', 'min-height', 'height',
  'display', 'position', 'text-align',
  'gap', 'row-gap', 'column-gap',
  'justify-content', 'align-items',
  'box-sizing'
];

async function main() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();
  console.log(`Navigating to ${LIVE_URL}...`);
  await page.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for Elementor to render
  await new Promise(r => setTimeout(r, 3000));

  // Take a screenshot for reference
  await page.screenshot({ path: 'reference/live-services-hero.png', fullPage: false });
  console.log('Screenshot saved to reference/live-services-hero.png');

  const results = await page.evaluate((props) => {
    const data = {};

    // Helper to get computed styles + bounding rect
    function extractEl(label, el) {
      if (!el) {
        data[label] = { error: 'Element not found' };
        return;
      }
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const styles = {};
      for (const p of props) {
        styles[p] = cs.getPropertyValue(p);
      }
      data[label] = {
        styles,
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        text: el.textContent.trim().substring(0, 80)
      };
    }

    // Find the hero section — walk up from the h1
    let heroContainer = null;
    const allHeadings = document.querySelectorAll('h1, h2, .elementor-heading-title');
    for (const h of allHeadings) {
      if (h.textContent.includes('Cybersecurity Services')) {
        // Walk up to find the section-level container
        let el = h;
        while (el && el !== document.body) {
          if (el.classList.contains('elementor-section') ||
              el.classList.contains('e-con') ||
              el.tagName === 'SECTION') {
            heroContainer = el;
          }
          el = el.parentElement;
        }
        break;
      }
    }

    extractEl('hero-section', heroContainer);

    // Also get the inner container
    if (heroContainer) {
      const innerContainer = heroContainer.querySelector('.elementor-container');
      extractEl('hero-inner-container', innerContainer);

      const innerColumn = heroContainer.querySelector('.elementor-column');
      extractEl('hero-column', innerColumn);

      const columnWrap = heroContainer.querySelector('.elementor-widget-wrap, .elementor-element-populated');
      extractEl('hero-column-wrap', columnWrap);
    }

    // Eyebrow
    const eyebrow = document.querySelector('[data-id="e14a232"] .elementor-heading-title')
      || document.querySelector('.elementor-heading-title');
    extractEl('hero-eyebrow', eyebrow);

    // H1
    const h1Candidates = document.querySelectorAll('.elementor-heading-title');
    let h1 = null;
    for (const el of h1Candidates) {
      if (el.textContent.includes('Cybersecurity Services')) {
        h1 = el;
        break;
      }
    }
    extractEl('hero-h1', h1);

    // Body text
    const bodyTextCandidates = document.querySelectorAll('.elementor-widget-text-editor p, .elementor-text-editor p');
    let bodyText = null;
    for (const el of bodyTextCandidates) {
      if (el.textContent.includes('journey')) {
        bodyText = el;
        break;
      }
    }
    extractEl('hero-body-text', bodyText);

    // Also check all background images in hero area
    if (heroContainer) {
      const allEls = heroContainer.querySelectorAll('*');
      const bgImages = [];
      for (const el of allEls) {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          bgImages.push({
            tag: el.tagName,
            class: el.className.substring(0, 100),
            dataId: el.getAttribute('data-id') || '',
            backgroundImage: bg,
            backgroundSize: window.getComputedStyle(el).backgroundSize,
            backgroundPosition: window.getComputedStyle(el).backgroundPosition,
            backgroundBlendMode: window.getComputedStyle(el).backgroundBlendMode,
            backgroundRepeat: window.getComputedStyle(el).backgroundRepeat,
            backgroundColor: window.getComputedStyle(el).backgroundColor
          });
        }
      }
      data['_background-images-in-hero'] = bgImages;
    }

    return data;
  }, PROPERTIES);

  console.log('\n=== LIVE SERVICES HERO — COMPUTED STYLES ===\n');
  console.log(JSON.stringify(results, null, 2));

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('reference/live-services-hero-styles.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to reference/live-services-hero-styles.json');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
