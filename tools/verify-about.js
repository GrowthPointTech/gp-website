const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/about.html', { waitUntil: 'networkidle0' });

  const styles = await page.evaluate(() => {
    const get = el => el ? {
      textAlign: getComputedStyle(el).textAlign,
      marginLeft: getComputedStyle(el).marginLeft,
      marginRight: getComputedStyle(el).marginRight,
      text: el.textContent.trim().slice(0, 60)
    } : null;
    return {
      eyebrow: get(document.querySelector('.hero--about__eyebrow')),
      h1: get(document.querySelector('.hero--about h1')),
      heroDesc: get(document.querySelector('.hero--about p:not(.hero--about__eyebrow)')),
      missionH2: get(document.querySelector('.about-mission h2')),
      missionP: get(document.querySelector('.about-mission p')),
    };
  });

  console.log(JSON.stringify(styles, null, 2));
  await page.screenshot({ path: 'reference/about-verify.png', fullPage: true });
  await browser.close();
})();
