// Pillar slider — text swipes up, colour wipes right→left on transition
(function () {
  var slider  = document.querySelector('.pillar-slider');
  var wipeEl  = document.querySelector('.pillar-slider__wipe');
  var slides  = document.querySelectorAll('.pillar-slider__slide');
  var dots    = document.querySelectorAll('.pillar-slider__dot');
  var pillars = document.querySelectorAll('.pillar[data-slide]');
  var prevBtn = document.querySelector('.pillar-slider__arrow--prev');
  var nextBtn = document.querySelector('.pillar-slider__arrow--next');
  if (!slider || !slides.length) return;

  var colors   = ['#080F1F', '#F6621C', '#0C50D5', '#95D316'];
  var darkText = [false,     false,     false,     true    ];
  var current  = 0;
  var busy     = false;
  var WIPE_MS  = 350;  // half-way duration
  var SLIDE_MS = 380;  // text animation duration

  // ------------------------------------------------------------------
  // Appearance helpers
  // ------------------------------------------------------------------
  function applyAppearance(idx) {
    var light  = !darkText[idx];
    var fg     = light ? '#ffffff' : '#080F1F';
    var dotOff = 'rgba(0,0,0,0.3)';

    if (prevBtn) prevBtn.style.color = fg;
    if (nextBtn) nextBtn.style.color = fg;

    dots.forEach(function (d, i) {
      d.style.backgroundColor = (i === idx) ? '#080F1F' : dotOff;
      if (i === idx) d.classList.add('pillar-slider__dot--active');
      else           d.classList.remove('pillar-slider__dot--active');
    });

    var slide = slides[idx];
    [slide.querySelector('.pillar-slider__heading')]
      .concat(Array.from(slide.querySelectorAll('.pillar-slider__desc')))
      .forEach(function (el) { if (el) el.style.color = fg; });
  }

  // ------------------------------------------------------------------
  // Core transition
  // ------------------------------------------------------------------
  function goTo(idx) {
    if (busy) return;
    idx = ((idx % slides.length) + slides.length) % slides.length;
    if (idx === current) return;
    busy = true;

    var oldSlide = slides[current];
    var newSlide = slides[idx];
    var newColor = colors[idx];

    // ---- Phase 1: colour wipe slides in from right (right→centre) ----
    wipeEl.style.backgroundColor = newColor;
    wipeEl.style.transition       = 'none';
    wipeEl.style.transform        = 'translateX(100%)';
    wipeEl.offsetHeight;                    // force reflow

    wipeEl.style.transition = 'transform ' + WIPE_MS + 'ms ease-in';
    wipeEl.style.transform  = 'translateX(0)';

    // Simultaneously: current text slides UP
    oldSlide.style.transition = 'transform ' + SLIDE_MS + 'ms ease-in, opacity ' + SLIDE_MS + 'ms ease-in';
    oldSlide.style.transform  = 'translateY(-60px)';
    oldSlide.style.opacity    = '0';

    setTimeout(function () {
      // ---- Mid-point: wipe covers slider — instant swap ----
      slider.style.backgroundColor = newColor;
      applyAppearance(idx);

      // Hide old, prepare new (below)
      oldSlide.classList.remove('pillar-slider__slide--active');
      oldSlide.style.transition = 'none';
      oldSlide.style.transform  = '';
      oldSlide.style.opacity    = '';

      newSlide.style.transition = 'none';
      newSlide.style.transform  = 'translateY(60px)';
      newSlide.style.opacity    = '0';
      newSlide.classList.add('pillar-slider__slide--active');
      newSlide.offsetHeight;               // force reflow

      current = idx;

      // ---- Phase 2: colour wipe continues off left (centre→left) ----
      wipeEl.style.transition = 'transform ' + WIPE_MS + 'ms ease-out';
      wipeEl.style.transform  = 'translateX(-100%)';

      // New text swipes UP into view
      newSlide.style.transition = 'transform ' + SLIDE_MS + 'ms ease-out, opacity ' + SLIDE_MS + 'ms ease-out';
      newSlide.style.transform  = 'translateY(0)';
      newSlide.style.opacity    = '1';

      setTimeout(function () { busy = false; }, WIPE_MS);
    }, WIPE_MS);
  }

  // ------------------------------------------------------------------
  // Event wiring
  // ------------------------------------------------------------------
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(this.getAttribute('data-index'), 10));
    });
  });

  pillars.forEach(function (p) {
    p.addEventListener('click', function () {
      goTo(parseInt(this.getAttribute('data-slide'), 10));
    });
  });

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  // Set initial state without animation
  slider.style.backgroundColor = colors[0];
  slides[0].classList.add('pillar-slider__slide--active');
  slides[0].style.transform = 'translateY(0)';
  slides[0].style.opacity   = '1';
  applyAppearance(0);
})();
