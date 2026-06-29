const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  // --- DESKTOP: 1280px ---
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3456/');
  await page.waitForNetworkIdle();

  await page.screenshot({ path: 'reference/nav-dropdown-desktop-hidden.png', clip: { x: 0, y: 0, width: 1280, height: 120 } });

  await page.hover('.nav__dropdown-toggle');
  await new Promise(function (r) { setTimeout(r, 400); });
  await page.screenshot({ path: 'reference/nav-dropdown-desktop-hover.png', clip: { x: 0, y: 0, width: 1280, height: 240 } });

  const menuVisible = await page.$eval('.nav__dropdown-menu', function (el) {
    return window.getComputedStyle(el).display !== 'none';
  });
  const items = await page.evaluate(function () {
    return Array.from(document.querySelectorAll('.nav__dropdown-menu a')).map(function (el) {
      return el.textContent.trim() + ' -> ' + el.getAttribute('href');
    });
  });
  console.log('Desktop dropdown visible on hover:', menuVisible);
  console.log('Dropdown items:', items);

  // --- MOBILE: 390px ---
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3456/');
  await page.waitForNetworkIdle();

  await page.click('.nav__toggle');
  await new Promise(function (r) { setTimeout(r, 400); });
  await page.screenshot({ path: 'reference/nav-dropdown-mobile-open.png', clip: { x: 0, y: 0, width: 390, height: 600 } });

  await page.click('.nav__dropdown-toggle');
  await new Promise(function (r) { setTimeout(r, 400); });
  await page.screenshot({ path: 'reference/nav-dropdown-mobile-expanded.png', clip: { x: 0, y: 0, width: 390, height: 700 } });

  const mobileMenuVisible = await page.$eval('.nav__dropdown-menu', function (el) {
    return window.getComputedStyle(el).display !== 'none';
  });
  console.log('Mobile sub-links visible after tap:', mobileMenuVisible);

  await browser.close();
})().catch(function (e) { console.error(e); process.exit(1); });
