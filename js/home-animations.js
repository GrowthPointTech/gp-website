// Hero load-in animations — mirrors Elementor's fadeIn/fadeInLeft (1.25s)
document.addEventListener('DOMContentLoaded', function () {
  var eyebrow = document.querySelector('.hero--home .hero__eyebrow');
  var h1      = document.querySelector('.hero--home h1');
  var body    = document.querySelector('.hero--home .hero__content > p');

  if (eyebrow) eyebrow.classList.add('hero-animate', 'hero-animate--fade-left', 'hero-animate--d1');
  if (h1)      h1.classList.add('hero-animate', 'hero-animate--fade-left', 'hero-animate--d2');
  if (body)    body.classList.add('hero-animate', 'hero-animate--fade-left', 'hero-animate--d3');
});
