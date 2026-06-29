const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  await page.goto('https://www.gptechadvisors.com/blog/', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r => setTimeout(r, 3000));

  const data = await page.evaluate(() => {
    const selectors = [
      '.elementor-post-info__terms-list-item',
      '.elementor-post-info__item--type-terms',
      '.elementor-post-info__item',
      '.elementor-icon-list-item',
      '.elementor-icon-list-text'
    ];
    const results = {};
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) { results[sel] = 'NOT FOUND'; continue; }
      const s = window.getComputedStyle(el);
      results[sel] = {
        bg: s.backgroundColor,
        color: s.color,
        borderRadius: s.borderRadius,
        padding: s.padding,
        display: s.display,
        fontSize: s.fontSize
      };
    }
    return results;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})().catch(e => console.error(e.message));
