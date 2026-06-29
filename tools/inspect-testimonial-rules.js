/**
 * Extract the ACTUAL CSS rules applied to the testimonial on the live site —
 * not just computed styles but the specific rules from stylesheets.
 */
const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://www.gptechadvisors.com', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const data = await page.evaluate(() => {
    // Wait for all animations to finish
    document.getAnimations().forEach(a => a.finish());

    const wrapper = document.querySelector('.elementor-testimonial-wrapper');
    const content = document.querySelector('.elementor-testimonial-content');
    const name    = document.querySelector('.elementor-testimonial-name');
    const job     = document.querySelector('.elementor-testimonial-job');
    const meta    = document.querySelector('.elementor-testimonial-meta');
    const widget  = document.querySelector('.elementor-widget-testimonial');

    function fullComputed(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      return {
        color:        c.color,
        opacity:      c.opacity,
        fontSize:     c.fontSize,
        fontWeight:   c.fontWeight,
        lineHeight:   c.lineHeight,
        letterSpacing:c.letterSpacing,
        fontStyle:    c.fontStyle,
        textTransform:c.textTransform,
        marginBottom: c.marginBottom,
        paddingLeft:  c.paddingLeft,
        textIndent:   c.textIndent,
        background:   c.background,
      };
    }

    // Get all CSS rules that match .elementor-testimonial-content
    const matchingRules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && (
            rule.selectorText.includes('testimonial') ||
            rule.selectorText.includes('large-testimonial')
          )) {
            matchingRules.push({
              selector: rule.selectorText,
              css: rule.cssText.substring(0, 300),
            });
          }
        }
      } catch(e) {}
    }

    return {
      wrapper:  fullComputed(wrapper),
      content:  fullComputed(content),
      name:     fullComputed(name),
      job:      fullComputed(job),
      meta:     fullComputed(meta),
      widget:   fullComputed(widget),
      matchingRules,
    };
  });

  console.log('\n=== COMPUTED (after animations finish) ===');
  ['wrapper','content','name','job','widget'].forEach(k => {
    console.log(`\n${k}:`);
    if (data[k]) Object.entries(data[k]).forEach(([p,v]) => console.log(`  ${p.padEnd(16)}: ${v}`));
  });

  console.log('\n=== CSS RULES matching testimonial ===');
  data.matchingRules.forEach(r => console.log(`\n  ${r.selector}\n  ${r.css}`));

  await browser.close();
}
main().catch(console.error);
