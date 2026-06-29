const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/about.html', { waitUntil: 'networkidle0' });

  const mission = await page.$('.about-mission');
  const missionBox = await mission.boundingBox();
  await page.screenshot({ path: 'reference/about-mission-fixed.png', clip: { x: 0, y: missionBox.y, width: 1440, height: missionBox.height } });

  const hero = await page.$('.hero--about');
  const heroBox = await hero.boundingBox();
  await page.screenshot({ path: 'reference/about-hero-fixed.png', clip: { x: 0, y: heroBox.y, width: 1440, height: heroBox.height } });

  await browser.close();
  console.log('Done');
})();
