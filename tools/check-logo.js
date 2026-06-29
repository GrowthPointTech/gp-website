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

  const logo = await page.evaluate(() => {
    const img = document.querySelector('footer img');
    if (!img) return null;
    const r = img.getBoundingClientRect();
    const s = window.getComputedStyle(img);
    return {width: Math.round(r.width), height: Math.round(r.height), cssWidth: s.width, cssHeight: s.height};
  });
  console.log('Live footer logo:', JSON.stringify(logo));
  await browser.close();
})().catch(e => console.error(e.message));
