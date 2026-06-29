const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // Handle basic auth if present
  await page.authenticate({ username: 'preview', password: 'preview' });

  const url = 'https://preview.gptechadvisors.com';

  try {
    await page.setViewport({ width: 1440, height: 900 });
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('HTTP status:', response.status());

    // Hover over Services
    await page.hover('.nav__dropdown-toggle');
    await new Promise(r => setTimeout(r, 400));

    const visible = await page.evaluate(() => {
      const menu = document.querySelector('.nav__dropdown-menu');
      if (!menu) return false;
      const style = window.getComputedStyle(menu);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    console.log('Dropdown visible on hover:', visible);

    await page.screenshot({ path: 'reference/preview-dropdown-hover.png' });
    console.log('Screenshot saved: reference/preview-dropdown-hover.png');

    // Move mouse to first menu item and click
    const firstItem = await page.$('.nav__dropdown-menu a');
    if (firstItem) {
      const box = await firstItem.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise(r => setTimeout(r, 200));
      const stillVisible = await page.evaluate(() => {
        const menu = document.querySelector('.nav__dropdown-menu');
        return window.getComputedStyle(menu).display !== 'none';
      });
      console.log('Dropdown still open when hovering over item:', stillVisible);
      await page.screenshot({ path: 'reference/preview-dropdown-item-hover.png' });
    }
  } catch (e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: 'reference/preview-error.png' });
  }

  await browser.close();
})();
