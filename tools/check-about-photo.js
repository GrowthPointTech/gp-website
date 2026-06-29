const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/about.html?bust=' + Date.now(), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => { const el = document.querySelector('.about-team'); if (el) el.scrollIntoView(); });
  await new Promise(r => setTimeout(r, 400));
  const info = await page.evaluate(() => {
    const photo = document.querySelector('.about-team__photo img');
    const photoCs = photo ? getComputedStyle(photo) : null;
    const photoRect = photo ? photo.getBoundingClientRect() : null;
    return {
      imgSrc: photo ? photo.src : null,
      imgWidth: photoCs ? photoCs.width : null,
      imgHeight: photoCs ? photoCs.height : null,
      imgDisplay: photoCs ? photoCs.display : null,
      imgVisibility: photoCs ? photoCs.visibility : null,
      imgNaturalWidth: photo ? photo.naturalWidth : null,
      rectWidth: photoRect ? photoRect.width : null,
      rectHeight: photoRect ? photoRect.height : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'reference/about-team-check.png' });
  await browser.close();
  console.log('Screenshot saved to reference/about-team-check.png');
})();
