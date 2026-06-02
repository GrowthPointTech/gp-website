#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://www.gptechadvisors.com/about/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const details = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return { error: 'not found: ' + sel };
      const c = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 200),
        bg: c.backgroundColor,
        bgImage: c.backgroundImage.substring(0, 100),
        color: c.color,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        textAlign: c.textAlign,
        padding: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
        minHeight: c.minHeight,
      };
    };

    // Hero section container
    const heroSection = document.querySelector('[data-id="77f3960a"]');
    const heroStyle = heroSection ? window.getComputedStyle(heroSection) : null;

    // Get all text inside the team/Stacey section
    const teamSection = document.querySelector('[data-id="131f3c0"]');
    const teamText = teamSection ? teamSection.innerText.trim() : 'not found';

    // Get Stacey bio paragraph text (text editor widgets)
    const bioParas = [];
    document.querySelectorAll('[data-id="131f3c0"] .elementor-widget-text-editor p, [data-id="131f3c0"] .elementor-text-editor p').forEach(p => {
      const t = p.textContent.trim();
      if (t) bioParas.push(t);
    });

    return {
      heroSection: heroStyle ? {
        bg: heroStyle.backgroundColor,
        bgImage: heroStyle.backgroundImage.substring(0, 200),
        minHeight: heroStyle.minHeight,
        padding: `${heroStyle.paddingTop} ${heroStyle.paddingBottom}`,
      } : 'not found',
      heroEyebrow: get('[data-id="cfe7e5"] .elementor-heading-title'),
      heroH1: get('[data-id="31000285"] .elementor-heading-title'),
      heroBody: get('[data-id="7026cbaf"] p'),
      teamHeading: get('[data-id="9fdc93a"] .elementor-heading-title'),
      staceyName: get('[data-id="e6275b4"] .elementor-heading-title'),
      staceyTitle: get('[data-id="23565a9f"]'),
      staceySocial: get('[data-id="944166a"]'),
      teamSectionFull: teamText.substring(0, 800),
      staceyBioParas: bioParas,
    };
  });

  console.log(JSON.stringify(details, null, 2));
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
