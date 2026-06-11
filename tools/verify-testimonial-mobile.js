const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:3000/?bust=${Date.now()}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const el = document.querySelector('.testimonial') || document.querySelector('[class*="testimonial"]') || document.querySelector('blockquote');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 400));

  const info = await page.evaluate(() => {
    const sel = ['.testimonial', '.home-testimonial', 'blockquote', '[class*="testimonial"]'];
    let el = null;
    for (const s of sel) { el = document.querySelector(s); if (el) break; }
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    const quote = el.querySelector('p, blockquote p, .testimonial__quote');
    const quoteCs = quote ? getComputedStyle(quote) : null;
    return {
      found: true,
      sectionClass: el.className,
      sectionBg: cs.backgroundColor,
      quoteText: quote ? quote.textContent.trim().slice(0, 80) : null,
      quoteFontSize: quoteCs ? quoteCs.fontSize : null,
      quoteColor: quoteCs ? quoteCs.color : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));

  await page.screenshot({ path: 'reference/testimonial-mobile-current.png' });
  await browser.close();
  console.log('Done');
})();
