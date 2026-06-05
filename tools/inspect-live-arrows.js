const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://www.gptechadvisors.com', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const data = await page.evaluate(() => {
    // Swiper navigation arrows used by Elementor loop-carousel
    const prev = document.querySelector('.swiper-button-prev, .elementor-swiper-button-prev, [class*="swiper-button"]');
    const next = document.querySelector('.swiper-button-next, .elementor-swiper-button-next');
    const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter(b => b.closest('[data-widget_type*="carousel"]') || b.closest('[data-widget_type*="swiper"]'))
      .map(b => {
        const c = window.getComputedStyle(b);
        return {
          class: b.className.substring(0, 80),
          bg: c.backgroundColor, color: c.color, border: c.border,
          w: Math.round(b.offsetWidth), h: Math.round(b.offsetHeight),
          borderRadius: c.borderRadius,
        };
      });

    function cs(el) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      return {
        class: el.className.substring(0, 80),
        bg: c.backgroundColor, color: c.color,
        border: c.border, borderRadius: c.borderRadius,
        w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight),
        display: c.display, content: el.innerHTML.substring(0, 200),
      };
    }

    // Get all swiper-related elements
    const swiperPrev = document.querySelector('.swiper-button-prev');
    const swiperNext = document.querySelector('.swiper-button-next');
    const elemPrev   = document.querySelector('.elementor-swiper-button-prev');
    const elemNext   = document.querySelector('.elementor-swiper-button-next');

    // Screenshot just the blog section arrows
    const blogSection = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts'));
    const blogContainer = blogSection?.closest('[data-element_type]');
    const arrowsInBlog = blogContainer?.querySelectorAll('[class*="swiper-button"], [class*="arrow"]');

    return {
      swiperPrev: cs(swiperPrev),
      swiperNext: cs(swiperNext),
      elemPrev: cs(elemPrev),
      elemNext: cs(elemNext),
      allButtons,
      arrowsInBlog: arrowsInBlog ? Array.from(arrowsInBlog).map(a => cs(a)) : [],
      // CSS rules for swiper buttons
      cssRules: (() => {
        const rules = [];
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.selectorText && rule.selectorText.includes('swiper-button')) {
                rules.push({ sel: rule.selectorText, css: rule.cssText.substring(0, 300) });
              }
            }
          } catch(e) {}
        }
        return rules;
      })(),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}
main().catch(console.error);
