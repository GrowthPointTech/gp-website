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

  const badges = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.elementor-post-info__terms-list-item')).map(el => {
      const s = window.getComputedStyle(el);
      return {
        text: el.textContent.trim(),
        bg: s.backgroundColor,
        color: s.color,
        borderRadius: s.borderRadius,
        padding: s.padding
      };
    });
  });

  // Dedupe by text
  const seen = new Set();
  badges.forEach(b => {
    if (!seen.has(b.text)) {
      seen.add(b.text);
      console.log(b.text + ':', JSON.stringify({bg: b.bg, color: b.color, padding: b.padding, borderRadius: b.borderRadius}));
    }
  });

  await browser.close();
})().catch(e => console.error(e.message));
