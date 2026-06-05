/**
 * Extract exact computed styles for services accordion, blog carousel, and testimonial.
 */
const puppeteer = require('puppeteer');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE = 'https://www.gptechadvisors.com';

async function main() {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(LIVE, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const data = await page.evaluate(() => {
    function cs(el, ...props) {
      if (!el) return null;
      const c = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const res = { _w: Math.round(r.width), _h: Math.round(r.height) };
      props.forEach(p => res[p] = c.getPropertyValue(p).trim());
      return res;
    }

    // ---- SERVICES SECTION ----
    const servicesH2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.trim() === 'Our Services');
    const servicesSection = servicesH2 ? servicesH2.closest('.e-con-boxed, section, [data-element_type="container"]') : null;
    const accordionItem = document.querySelector('.e-n-accordion-item');
    const accordionSummary = document.querySelector('.e-n-accordion-item-title');
    const accordionTitleText = document.querySelector('.e-n-accordion-item-title-text');
    const eyebrow = Array.from(document.querySelectorAll('.elementor-heading-title')).find(el => el.textContent.includes('Build and scale with confidence'));
    const learnMoreLink = document.querySelector('.e-n-accordion-item .elementor-heading-title a');
    const accordionContent = document.querySelector('.e-n-accordion-item .elementor-widget-text-editor p');

    // ---- BLOG SECTION ----
    const blogH2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Blog Posts'));
    const blogSection = blogH2 ? blogH2.closest('.e-con-full.e-flex, section') : null;
    const blogIntro = document.querySelector('[data-id="0be8ef1"] p');
    const carousel = document.querySelector('.elementor-widget-loop-carousel, .swiper-container, .swiper');
    const blogCard = document.querySelector('.elementor-loop-item, .elementor-post');

    // ---- TESTIMONIAL ----
    const testimonialWrapper = document.querySelector('.elementor-testimonial-wrapper');
    const testimonialContent = document.querySelector('.elementor-testimonial-content');
    const testimonialName = document.querySelector('.elementor-testimonial-name');
    const testimonialJob = document.querySelector('.elementor-testimonial-job');
    const testimonialImg = document.querySelector('.elementor-testimonial-image img');
    const testimonialSection = testimonialWrapper ? testimonialWrapper.closest('.e-con, section') : null;

    return {
      services: {
        eyebrow: cs(eyebrow, 'font-size','font-weight','color','text-transform','letter-spacing','margin-bottom'),
        h2: cs(servicesH2, 'font-size','font-weight','color','margin-bottom','text-align','line-height'),
        section: servicesSection ? cs(servicesSection, 'background-color','padding-top','padding-bottom','padding-left','padding-right','max-width') : null,
        accordionItem: cs(accordionItem, 'border-top','border-bottom','border-left','border-right','padding-top','padding-bottom','margin-bottom','background-color'),
        accordionSummary: cs(accordionSummary, 'font-size','font-weight','color','padding-top','padding-bottom','cursor','background-color','display','align-items'),
        accordionTitleText: cs(accordionTitleText, 'font-size','font-weight','color','letter-spacing','text-transform'),
        accordionContent: cs(accordionContent, 'font-size','color','line-height','margin-bottom'),
        learnMore: cs(learnMoreLink, 'font-size','font-weight','color','text-decoration','letter-spacing'),
      },
      blog: {
        h2: cs(blogH2, 'font-size','font-weight','color','text-align','margin-bottom'),
        intro: cs(blogIntro, 'font-size','color','text-align','margin-bottom'),
        section: blogSection ? cs(blogSection, 'background-color','padding-top','padding-bottom') : null,
        carousel: cs(carousel, 'width','overflow','display'),
        card: cs(blogCard, 'background-color','border-radius','box-shadow','width','overflow'),
      },
      testimonial: {
        section: cs(testimonialSection, 'background-color','padding-top','padding-bottom','padding-left','padding-right'),
        content: cs(testimonialContent, 'font-size','font-weight','font-style','color','line-height','text-align','margin-bottom'),
        name: cs(testimonialName, 'font-size','font-weight','color','margin-top'),
        job: cs(testimonialJob, 'font-size','color','font-style'),
        imgSize: testimonialImg ? { width: testimonialImg.offsetWidth, height: testimonialImg.offsetHeight } : null,
        wrapperDisplay: cs(testimonialWrapper, 'display','flex-direction','align-items','text-align'),
      },
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

main().catch(console.error);
