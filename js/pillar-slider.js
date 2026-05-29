// Pillar description slider — matches live site's swiper carousel behavior
(function () {
  var slides = document.querySelectorAll('.pillar-slider__slide');
  var dots = document.querySelectorAll('.pillar-slider__dot');
  var pillars = document.querySelectorAll('.pillar[data-slide]');
  var prevBtn = document.querySelector('.pillar-slider__arrow--prev');
  var nextBtn = document.querySelector('.pillar-slider__arrow--next');
  var current = 0;

  if (!slides.length) return;

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides[current].classList.remove('pillar-slider__slide--active');
    dots[current].classList.remove('pillar-slider__dot--active');

    current = index;

    slides[current].classList.add('pillar-slider__slide--active');
    dots[current].classList.add('pillar-slider__dot--active');
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(this.getAttribute('data-index'), 10));
    });
  });

  pillars.forEach(function (pillar) {
    pillar.addEventListener('click', function () {
      goTo(parseInt(this.getAttribute('data-slide'), 10));
    });
  });
})();
