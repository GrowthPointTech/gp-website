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

  // Get all card category data
  const cardData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.e-loop-item')).map(card => {
      const terms = Array.from(card.querySelectorAll('.elementor-post-info__terms-list-item')).map(t => t.textContent.trim());
      const title = card.querySelector('h3');
      return {
        title: title ? title.textContent.trim().substring(0, 50) : '?',
        categories: terms
      };
    });
  });

  console.log('Live card categories:');
  cardData.forEach(c => console.log(' ', JSON.stringify(c.categories), '|', c.title));

  // Screenshot first row (3 cards)
  const path = require('path');
  await page.screenshot({
    path: path.join(__dirname, '..', 'reference', 'all-cards-live.png'),
    clip: {x: 60, y: 650, width: 1320, height: 800}
  });

  await browser.close();
})().catch(e => console.error(e.message));
