/**
 * Inspect the 6 homepage issues — live uses Elementor selectors, local uses our selectors.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://www.gptechadvisors.com';
const LOCAL_PORT = 8765;
const LOCAL_ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startLocalServer(root, port) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let fp = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(fp);
      const types = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      fs.createReadStream(fp).pipe(res);
    });
    srv.listen(port, () => resolve(srv));
  });
}

async function getStyles(page, selector, props) {
  return page.evaluate((sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    const result = {};
    props.forEach(p => result[p] = cs.getPropertyValue(p).trim());
    const r = el.getBoundingClientRect();
    result._width = Math.round(r.width);
    result._height = Math.round(r.height);
    return result;
  }, selector, props);
}

async function main() {
  const srv = await startLocalServer(LOCAL_ROOT, LOCAL_PORT);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox']
  });

  const livePage = await browser.newPage();
  await livePage.setViewport({ width: 1280, height: 900 });
  await livePage.goto(LIVE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const localPage = await browser.newPage();
  await localPage.setViewport({ width: 1280, height: 900 });
  await localPage.goto(`http://localhost:${LOCAL_PORT}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n==================================================');
  console.log('ISSUE 1: LOAD-IN TRANSITIONS');
  console.log('==================================================');

  // What animation classes does Elementor add?
  const liveAnimations = await livePage.evaluate(() => {
    const els = document.querySelectorAll('.animated');
    return Array.from(els).map(el => {
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        classes: el.className.split(' ').filter(c => c.includes('fade') || c.includes('animated') || c.includes('In') || c.includes('slide')),
        animation: cs.getPropertyValue('animation'),
        animationName: cs.getPropertyValue('animation-name'),
        opacity: cs.getPropertyValue('opacity'),
        transform: cs.getPropertyValue('transform'),
      };
    }).slice(0, 10);
  });
  console.log('Live animated elements:');
  liveAnimations.forEach(a => console.log('  ', a.classes.join(' '), '| animation:', a.animation.substring(0,80)));

  // Check for animation CSS on live site
  const liveAnimCss = await livePage.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const rules = [];
    for (const sheet of sheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && (rule.selectorText.includes('fadeIn') || rule.selectorText.includes('.animated'))) {
            rules.push({ selector: rule.selectorText, css: rule.cssText.substring(0, 200) });
          }
        }
      } catch(e) {}
    }
    return rules.slice(0, 20);
  });
  console.log('\nAnimation CSS rules on live site:');
  liveAnimCss.forEach(r => console.log(' ', r.selector, '→', r.css));

  // Local — any animations?
  const localAnimations = await localPage.evaluate(() => {
    const all = document.querySelectorAll('*');
    const animated = [];
    for (const el of all) {
      const cs = window.getComputedStyle(el);
      const anim = cs.getPropertyValue('animation-name');
      if (anim && anim !== 'none') animated.push({ tag: el.tagName, class: el.className, animation: anim });
    }
    return animated.slice(0, 10);
  });
  console.log('\nLocal animated elements:', localAnimations.length ? localAnimations : 'NONE');

  console.log('\n==================================================');
  console.log('ISSUE 2: SECTION SIZING (padding/margin)');
  console.log('==================================================');

  const sectionProps = ['padding-top','padding-bottom','padding-left','padding-right','margin-top','margin-bottom','background-color'];

  // Live site uses Elementor containers — find sections by their content
  const liveSections = await livePage.evaluate(() => {
    // Find each major section by landmark content
    const sections = {};
    // Hero
    const hero = document.querySelector('.elementor-location-single .e-con, section.e-con') ||
                 document.querySelector('[data-id]');
    // Find by heading text
    const headings = document.querySelectorAll('h1, h2');
    headings.forEach(h => {
      const text = h.textContent.trim();
      const section = h.closest('section, .e-con-boxed, [data-element_type="section"]') ||
                      h.closest('.elementor-section') ||
                      h.parentElement.parentElement.parentElement;
      if (!section) return;
      const cs = window.getComputedStyle(section);
      const rect = section.getBoundingClientRect();
      sections[text.substring(0,40)] = {
        tag: section.tagName,
        class: section.className.split(' ').filter(c => c.includes('elementor')).join(' '),
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        height: Math.round(rect.height),
        bgColor: cs.backgroundColor,
      };
    });
    return sections;
  });
  console.log('Live site sections (by heading):');
  Object.entries(liveSections).forEach(([k,v]) => console.log(`  "${k}": pt=${v.paddingTop} pb=${v.paddingBottom} h=${v.height} bg=${v.bgColor}`));

  const localSections = await localPage.evaluate(() => {
    const map = {};
    document.querySelectorAll('section').forEach(s => {
      const cs = window.getComputedStyle(s);
      const rect = s.getBoundingClientRect();
      map[s.className] = {
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        height: Math.round(rect.height),
        bgColor: cs.backgroundColor,
      };
    });
    return map;
  });
  console.log('\nLocal site sections:');
  Object.entries(localSections).forEach(([k,v]) => console.log(`  .${k}: pt=${v.paddingTop} pb=${v.paddingBottom} h=${v.height} bg=${v.bgColor}`));

  console.log('\n==================================================');
  console.log('ISSUE 3: SERVICES SECTION');
  console.log('==================================================');

  // Live services section — find "Our Services" heading container
  const liveServices = await livePage.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Our Services'));
    if (!h2) return { error: 'h2 not found' };
    const section = h2.closest('section, .e-con-boxed, .elementor-section') || h2.parentElement.parentElement;
    const cs = window.getComputedStyle(section);
    // Find the cards/columns
    const cards = section.querySelectorAll('.elementor-column, .elementor-widget-wrap, .e-con');
    const cardData = Array.from(cards).slice(0,4).map(c => {
      const ccs = window.getComputedStyle(c);
      return {
        class: c.className.split(' ').filter(c2 => c2.includes('elementor')).join(' ').substring(0,60),
        width: ccs.width,
        padding: `${ccs.paddingTop} ${ccs.paddingRight} ${ccs.paddingBottom} ${ccs.paddingLeft}`,
        display: ccs.display,
      };
    });
    // Find h2 styles
    const h2cs = window.getComputedStyle(h2);
    return {
      sectionBg: cs.backgroundColor,
      sectionPt: cs.paddingTop,
      sectionPb: cs.paddingBottom,
      h2FontSize: h2cs.fontSize,
      h2FontWeight: h2cs.fontWeight,
      h2Color: h2cs.color,
      h2MarginBottom: h2cs.marginBottom,
      h2TextAlign: h2cs.textAlign,
      cards: cardData,
    };
  });
  console.log('Live Services Section:', JSON.stringify(liveServices, null, 2));

  // Find service cards specifically
  const liveServiceCards = await livePage.evaluate(() => {
    // Service cards are icon-box widgets
    const iconBoxes = document.querySelectorAll('.elementor-widget-icon-box, .elementor-icon-box-wrapper');
    return Array.from(iconBoxes).slice(0,3).map(box => {
      const cs = window.getComputedStyle(box);
      const title = box.querySelector('h3, .elementor-icon-box-title');
      const desc = box.querySelector('p, .elementor-icon-box-description');
      const link = box.querySelector('a');
      const icon = box.querySelector('img, svg, .elementor-icon');
      return {
        class: box.className.substring(0,60),
        bg: cs.backgroundColor,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        width: cs.width,
        titleText: title ? title.textContent.trim().substring(0,40) : null,
        titleFs: title ? window.getComputedStyle(title).fontSize : null,
        titleFw: title ? window.getComputedStyle(title).fontWeight : null,
        titleColor: title ? window.getComputedStyle(title).color : null,
        descFs: desc ? window.getComputedStyle(desc).fontSize : null,
        descColor: desc ? window.getComputedStyle(desc).color : null,
        linkText: link ? link.textContent.trim() : null,
        linkColor: link ? window.getComputedStyle(link).color : null,
        linkDecoration: link ? window.getComputedStyle(link).textDecoration : null,
        iconWidth: icon ? window.getComputedStyle(icon).width : null,
      };
    });
  });
  console.log('\nLive Service Cards:', JSON.stringify(liveServiceCards, null, 2));

  const localServiceCards = await localPage.evaluate(() => {
    return Array.from(document.querySelectorAll('.services-overview .card')).map(card => {
      const cs = window.getComputedStyle(card);
      const title = card.querySelector('.card__title');
      const desc = card.querySelector('.card__text');
      const link = card.querySelector('.card__link');
      const icon = card.querySelector('.card__icon');
      return {
        bg: cs.backgroundColor,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        width: cs.width,
        titleFs: title ? window.getComputedStyle(title).fontSize : null,
        titleFw: title ? window.getComputedStyle(title).fontWeight : null,
        titleColor: title ? window.getComputedStyle(title).color : null,
        descFs: desc ? window.getComputedStyle(desc).fontSize : null,
        descColor: desc ? window.getComputedStyle(desc).color : null,
        linkColor: link ? window.getComputedStyle(link).color : null,
        linkDecoration: link ? window.getComputedStyle(link).textDecoration : null,
        iconWidth: icon ? window.getComputedStyle(icon).width : null,
      };
    });
  });
  console.log('\nLocal Service Cards:', JSON.stringify(localServiceCards, null, 2));

  console.log('\n==================================================');
  console.log('ISSUE 4: BLOG HIGHLIGHTS SECTION');
  console.log('==================================================');

  const liveBlog = await livePage.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog') || h.textContent.includes('Insights'));
    if (!h2) return { error: 'No blog h2 found' };
    const h2cs = window.getComputedStyle(h2);
    const section = h2.closest('section, .e-con-boxed, .elementor-section') || h2.parentElement.parentElement;
    const scs = window.getComputedStyle(section);
    // Find blog cards
    const cards = section.querySelectorAll('.elementor-post, .elementor-posts--skin-cards article, article');
    const cardData = Array.from(cards).slice(0,3).map(c => {
      const ccs = window.getComputedStyle(c);
      return {
        width: ccs.width, bg: ccs.backgroundColor, borderRadius: ccs.borderRadius,
        boxShadow: ccs.boxShadow, overflow: ccs.overflow,
        padding: `${ccs.paddingTop} ${ccs.paddingRight} ${ccs.paddingBottom} ${ccs.paddingLeft}`,
      };
    });
    return {
      h2Text: h2.textContent.trim(),
      h2Fs: h2cs.fontSize, h2Fw: h2cs.fontWeight, h2Color: h2cs.color, h2Align: h2cs.textAlign,
      sectionBg: scs.backgroundColor,
      sectionPt: scs.paddingTop, sectionPb: scs.paddingBottom,
      cards: cardData,
    };
  });
  console.log('Live Blog Section:', JSON.stringify(liveBlog, null, 2));

  const localBlog = await localPage.evaluate(async () => {
    // Wait for blog cards to be injected by JS
    await new Promise(r => setTimeout(r, 1000));
    const h2 = document.querySelector('.blog-highlights h2');
    const intro = document.querySelector('.blog-highlights__intro');
    const section = document.querySelector('.blog-highlights');
    const grid = document.querySelector('#home-blog-grid');
    const cards = grid ? grid.querySelectorAll('[class]') : [];
    const h2cs = h2 ? window.getComputedStyle(h2) : null;
    const scs = section ? window.getComputedStyle(section) : null;
    const cardData = Array.from(cards).slice(0,3).map(c => {
      const ccs = window.getComputedStyle(c);
      return {
        tag: c.tagName, class: c.className,
        width: ccs.width, bg: ccs.backgroundColor, borderRadius: ccs.borderRadius,
        padding: `${ccs.paddingTop} ${ccs.paddingRight} ${ccs.paddingBottom} ${ccs.paddingLeft}`,
      };
    });
    return {
      h2Fs: h2cs ? h2cs.fontSize : null,
      h2Fw: h2cs ? h2cs.fontWeight : null,
      h2Color: h2cs ? h2cs.color : null,
      sectionBg: scs ? scs.backgroundColor : null,
      sectionPt: scs ? scs.paddingTop : null,
      sectionPb: scs ? scs.paddingBottom : null,
      gridDisplay: grid ? window.getComputedStyle(grid).display : null,
      gridChildCount: grid ? grid.children.length : 0,
      cards: cardData,
    };
  });
  console.log('\nLocal Blog Section:', JSON.stringify(localBlog, null, 2));

  console.log('\n==================================================');
  console.log('ISSUE 5: TESTIMONIAL / QUOTE FORMATTING');
  console.log('==================================================');

  const liveQuote = await livePage.evaluate(() => {
    // Find by "Stacey" or the testimonial text
    const allText = document.querySelectorAll('blockquote, .elementor-widget-text-editor p, .elementor-testimonial');
    const quoteEl = Array.from(allText).find(el => el.textContent.includes('Stacey consistently') || el.textContent.includes('Clayton'));
    if (!quoteEl) return { error: 'quote not found', tried: Array.from(allText).map(e=>e.textContent.substring(0,30)) };
    const section = quoteEl.closest('section, .e-con-boxed, .elementor-section') || quoteEl.parentElement.parentElement;
    const scs = window.getComputedStyle(section);
    const qcs = window.getComputedStyle(quoteEl);
    const parent = quoteEl.parentElement;
    const pcs = window.getComputedStyle(parent);
    // Find author
    const allInSection = section.querySelectorAll('*');
    let authorEl, roleEl;
    for (const el of allInSection) {
      if (el.textContent.trim() === 'Clayton Dillard') authorEl = el;
      if (el.textContent.includes('CEO') && el.textContent.includes('Legion')) roleEl = el;
    }
    return {
      quoteTag: quoteEl.tagName,
      quoteFontSize: qcs.fontSize,
      quoteFontWeight: qcs.fontWeight,
      quoteColor: qcs.color,
      quoteLineHeight: qcs.lineHeight,
      quoteFontStyle: qcs.fontStyle,
      quoteTextAlign: qcs.textAlign,
      quotePadding: `${qcs.paddingTop} ${qcs.paddingRight} ${qcs.paddingBottom} ${qcs.paddingLeft}`,
      quoteMargin: `${qcs.marginTop} ${qcs.marginRight} ${qcs.marginBottom} ${qcs.marginLeft}`,
      quoteBorderLeft: qcs.borderLeft,
      quoteQuotes: qcs.quotes,
      parentDisplay: pcs.display,
      parentTextAlign: pcs.textAlign,
      sectionBg: scs.backgroundColor,
      sectionPt: scs.paddingTop,
      sectionPb: scs.paddingBottom,
      authorFs: authorEl ? window.getComputedStyle(authorEl).fontSize : null,
      authorFw: authorEl ? window.getComputedStyle(authorEl).fontWeight : null,
      authorColor: authorEl ? window.getComputedStyle(authorEl).color : null,
      roleFs: roleEl ? window.getComputedStyle(roleEl).fontSize : null,
      roleColor: roleEl ? window.getComputedStyle(roleEl).color : null,
    };
  });
  console.log('Live Quote:', JSON.stringify(liveQuote, null, 2));

  const localQuote = await localPage.evaluate(() => {
    const blockquote = document.querySelector('.testimonial__quote, .testimonial blockquote');
    const author = document.querySelector('.testimonial__author');
    const role = document.querySelector('.testimonial__role');
    const section = document.querySelector('.testimonial');
    if (!blockquote) return { error: 'no blockquote found' };
    const qcs = window.getComputedStyle(blockquote);
    const scs = window.getComputedStyle(section);
    return {
      quoteFontSize: qcs.fontSize,
      quoteFontWeight: qcs.fontWeight,
      quoteColor: qcs.color,
      quoteLineHeight: qcs.lineHeight,
      quoteFontStyle: qcs.fontStyle,
      quoteTextAlign: qcs.textAlign,
      quotePadding: `${qcs.paddingTop} ${qcs.paddingRight} ${qcs.paddingBottom} ${qcs.paddingLeft}`,
      quoteMargin: `${qcs.marginTop} ${qcs.marginRight} ${qcs.marginBottom} ${qcs.marginLeft}`,
      quoteBorderLeft: qcs.borderLeft,
      quoteQuotes: qcs.quotes,
      sectionBg: scs.backgroundColor,
      sectionPt: scs.paddingTop,
      sectionPb: scs.paddingBottom,
      authorFs: author ? window.getComputedStyle(author).fontSize : null,
      authorFw: author ? window.getComputedStyle(author).fontWeight : null,
      authorColor: author ? window.getComputedStyle(author).color : null,
      roleFs: role ? window.getComputedStyle(role).fontSize : null,
      roleColor: role ? window.getComputedStyle(role).color : null,
    };
  });
  console.log('\nLocal Quote:', JSON.stringify(localQuote, null, 2));

  console.log('\n==================================================');
  console.log('ISSUE 6: FOOTER SOCIAL LINKS (border-radius)');
  console.log('==================================================');

  const liveSocial = await livePage.evaluate(() => {
    const socialLinks = document.querySelectorAll('.elementor-social-icon, .elementor-share-btn, a[href*="linkedin"], a[href*="twitter"], a[href*="x.com"]');
    const footerSocial = Array.from(socialLinks).filter(el => el.closest('footer, .elementor-location-footer'));
    return footerSocial.slice(0,3).map(el => {
      const cs = window.getComputedStyle(el);
      const icon = el.querySelector('svg, i, img');
      const ics = icon ? window.getComputedStyle(icon) : null;
      return {
        tag: el.tagName,
        class: el.className.substring(0,80),
        href: el.href,
        width: cs.width,
        height: cs.height,
        borderRadius: cs.borderRadius,
        display: cs.display,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        backgroundColor: cs.backgroundColor,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        iconWidth: ics ? ics.width : null,
        iconHeight: ics ? ics.height : null,
        iconColor: ics ? ics.color : null,
        iconFill: ics ? ics.fill : null,
      };
    });
  });
  console.log('Live Social Links:', JSON.stringify(liveSocial, null, 2));

  const localSocial = await localPage.evaluate(() => {
    return Array.from(document.querySelectorAll('.footer__social-icon')).map(el => {
      const cs = window.getComputedStyle(el);
      const icon = el.querySelector('svg');
      const ics = icon ? window.getComputedStyle(icon) : null;
      return {
        width: cs.width,
        height: cs.height,
        borderRadius: cs.borderRadius,
        display: cs.display,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        backgroundColor: cs.backgroundColor,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        iconWidth: ics ? ics.width : null,
        iconHeight: ics ? ics.height : null,
        iconColor: ics ? ics.color : null,
        iconFill: ics ? ics.fill : null,
      };
    });
  });
  console.log('\nLocal Social Links:', JSON.stringify(localSocial, null, 2));

  await browser.close();
  srv.close();
}

main().catch(err => { console.error(err); process.exit(1); });
