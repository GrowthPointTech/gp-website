(function () {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.blog-fade').forEach(function (el) {
    observer.observe(el);
  });

  // Stagger cards in sequence when the grid becomes visible
  const gridObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var cards = entry.target.querySelectorAll('.blog-card');
        cards.forEach(function (card, i) {
          card.style.opacity = '0';
          card.style.animation = 'none';
          setTimeout(function () {
            card.style.animation = 'aboutFadeIn 0.9s ease forwards';
          }, i * 180);
        });
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

  var grid = document.getElementById('blog-card-grid');
  if (grid) gridObserver.observe(grid);
})();
