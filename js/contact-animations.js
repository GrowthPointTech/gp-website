document.addEventListener('DOMContentLoaded', function () {

  // Hero — direction-aware vertical sweep
  var heroContainer = document.querySelector('.hero .container');
  var lastScrollY = window.scrollY;
  var scrollDir = 1;

  window.addEventListener('scroll', function () {
    scrollDir = window.scrollY < lastScrollY ? -1 : 1;
    lastScrollY = window.scrollY;
  }, { passive: true });

  if (heroContainer) {
    var heroObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        var fromTop = scrollDir === -1;
        heroContainer.classList.add('no-transition');
        heroContainer.classList.remove('is-visible');
        heroContainer.classList.toggle('from-top', fromTop);
        heroContainer.getBoundingClientRect();
        heroContainer.classList.remove('no-transition');
        setTimeout(function () { heroContainer.classList.add('is-visible'); }, 350);
      } else {
        heroContainer.classList.toggle('from-top', scrollDir === 1);
        heroContainer.classList.remove('is-visible');
      }
    }, { threshold: 0.2 });
    heroObserver.observe(document.querySelector('.hero'));
  }

  // Calendly header — sweep up
  var calendlyContainer = document.querySelector('.contact-calendly .container');
  if (calendlyContainer) {
    new IntersectionObserver(function (entries) {
      calendlyContainer.classList.toggle('is-visible', entries[0].isIntersecting);
    }, { threshold: 0.2 }).observe(calendlyContainer);
  }

  // Fallback columns — swipe from opposite sides
  var fallbackText = document.querySelector('.contact-fallback__text');
  var fallbackInfo = document.querySelector('.contact-fallback__info');
  var fallbackGrid = document.querySelector('.contact-fallback__inner');

  if (fallbackGrid) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (fallbackText) fallbackText.classList.toggle('is-visible', visible);
      if (fallbackInfo) fallbackInfo.classList.toggle('is-visible', visible);
    }, { threshold: 0.15 }).observe(fallbackGrid);
  }
});
