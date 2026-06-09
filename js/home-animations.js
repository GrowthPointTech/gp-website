// Services accordion: open on mobile, closed on desktop
(function () {
  function syncAccordion() {
    var items = document.querySelectorAll('.services-accordion__item');
    var mobile = window.innerWidth <= 767;
    items.forEach(function (item) {
      if (mobile) { item.setAttribute('open', ''); }
      else { item.removeAttribute('open'); }
    });
  }
  document.addEventListener('DOMContentLoaded', syncAccordion);
  window.addEventListener('resize', syncAccordion);
})();

// Hero load-in animations — mirrors Elementor's fadeIn/fadeInLeft (1.25s)
document.addEventListener('DOMContentLoaded', function () {
  var eyebrow = document.querySelector('.hero--home .hero__eyebrow');
  var h1      = document.querySelector('.hero--home h1');
  var body    = document.querySelector('.hero--home .hero__content > p');

  if (eyebrow) eyebrow.classList.add('hero-animate', 'hero-animate--fade-left', 'hero-animate--d1');
  if (h1)      h1.classList.add('hero-animate', 'hero-animate--fade-left', 'hero-animate--d2');
  if (body)    body.classList.add('hero-animate', 'hero-animate--fade-left', 'hero-animate--d3');

  // Scroll-triggered animations (IntersectionObserver)
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-animate').forEach(function (el) {
    observer.observe(el);
  });
});
