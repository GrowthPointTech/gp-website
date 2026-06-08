const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  console.log('Navigating to live blog...');
  await page.goto('https://www.gptechadvisors.com/blog/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));

  const result = await page.evaluate(function() {
    // Find the first blog post card
    const cards = document.querySelectorAll('.e-loop-item');
    if (!cards.length) return { error: 'No cards found' };

    const card = cards[0];
    const cs = getComputedStyle(card);

    // Find category/tag elements
    const tagList = card.querySelector('.elementor-icon-list-items');
    const tagItems = card.querySelectorAll('.elementor-icon-list-item');
    const tagTexts = card.querySelectorAll('.elementor-icon-list-text');

    function getStyles(el) {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        color: s.color,
        backgroundColor: s.backgroundColor,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: s.fontFamily,
        textTransform: s.textTransform,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        padding: s.padding,
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        display: s.display,
        gap: s.gap,
      };
    }

    // Card container styles
    const cardStyles = {
      backgroundColor: cs.backgroundColor,
      borderRadius: cs.borderRadius,
      padding: cs.padding,
    };

    // Tag list styles
    const listStyles = tagList ? getStyles(tagList) : null;

    // First tag item
    const firstTagStyles = tagItems[0] ? getStyles(tagItems[0]) : null;

    // First tag text (the link/text element)
    const firstTagTextStyles = tagTexts[0] ? getStyles(tagTexts[0]) : null;

    // Collect all visible category tags and their styles
    const allTagData = Array.from(tagTexts).map(function(el) {
      const s = getComputedStyle(el);
      return {
        text: el.textContent.trim(),
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        textTransform: s.textTransform,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
      };
    });

    // Get the image element styles
    const img = card.querySelector('img');
    const imgStyles = img ? getStyles(img) : null;

    // Get the heading/title styles
    const heading = card.querySelector('.elementor-heading-title');
    const headingStyles = heading ? getStyles(heading) : null;

    // Get the "View More" / "Read More" link styles
    const readMore = card.querySelector('.elementor-button, a[href*="blog"]');

    // Get category section container padding
    const tagSection = card.querySelector('.elementor-element-8a6b2b3');
    const tagSectionStyles = tagSection ? getStyles(tagSection) : null;

    return {
      cardStyles,
      listStyles,
      firstTagStyles,
      firstTagTextStyles,
      allTagData: allTagData.slice(0, 6),
      imgStyles,
      headingStyles,
      tagSectionStyles,
      // Also check for category-specific colors
      tagHTMLSample: tagList ? tagList.innerHTML.substring(0, 500) : 'no tag list',
      cardHTMLSample: card.innerHTML.substring(0, 1000),
    };
  });

  console.log('\n=== LIVE SITE BLOG CARD STYLES ===\n');
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
