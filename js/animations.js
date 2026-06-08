(function () {
  if (!('IntersectionObserver' in window)) return;

  var elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  elements.forEach(function (el) {
    el.style.visibility = 'hidden';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var anim = el.getAttribute('data-animate');
      var delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);

      function trigger() {
        el.style.visibility = '';
        el.classList.add('animated', anim);
        observer.unobserve(el);
      }

      delay > 0 ? setTimeout(trigger, delay) : trigger();
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();
