// Pillar description slider — matches live site's swiper carousel behavior
(function () {
  var slider = document.querySelector('.pillar-slider');
  var slides = document.querySelectorAll('.pillar-slider__slide');
  var dots = document.querySelectorAll('.pillar-slider__dot');
  var pillars = document.querySelectorAll('.pillar[data-slide]');
  var prevBtn = document.querySelector('.pillar-slider__arrow--prev');
  var nextBtn = document.querySelector('.pillar-slider__arrow--next');
  var current = 0;

  // Map slide index to slider background color
  var colors = ['#080F1F', '#F6621C', '#6C5CE7', '#A4E322'];
  // Text should be dark on lime
  var darkText = [false, false, false, true];

  if (!slides.length || !slider) return;

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides[current].classList.remove('pillar-slider__slide--active');
    dots[current].classList.remove('pillar-slider__dot--active');

    current = index;

    slides[current].classList.add('pillar-slider__slide--active');
    dots[current].classList.add('pillar-slider__dot--active');

    // Update slider container background color
    slider.style.backgroundColor = colors[current];

    // Update arrow and dot colors for readability
    var textColor = darkText[current] ? '#080F1F' : '#FFFFFF';
    var dotInactive = darkText[current] ? 'rgba(8,15,31,0.3)' : 'rgba(255,255,255,0.3)';

    prevBtn.style.color = textColor;
    nextBtn.style.color = textColor;

    dots.forEach(function (dot, i) {
      dot.style.backgroundColor = (i === current) ? textColor : dotInactive;
    });
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

  // Initialize first slide colors
  goTo(0);
})();
