(function () {
  var track    = document.getElementById('home-blog-grid');
  var carousel = track && track.closest('.blog-carousel');
  if (!track || !carousel) return;

  var prevBtn = carousel.querySelector('.blog-carousel__arrow--prev');
  var nextBtn = carousel.querySelector('.blog-carousel__arrow--next');
  var GAP     = 20;
  var currentCloneIdx = 0; // index in cloned array
  var isAnimating     = false;
  var realTotal       = 0;

  function cardWidth() {
    var c = track.querySelector('.blog-card');
    return c ? c.offsetWidth : Math.round(window.innerWidth * 0.8);
  }

  function centerOffset(idx) {
    // translateX that centers card [idx] in the viewport
    var vw = window.innerWidth;
    var cw = cardWidth();
    return (vw - cw) / 2 - idx * (cw + GAP);
  }

  function moveTo(idx, animate) {
    track.style.transition = animate
      ? 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none';
    track.style.transform = 'translateX(' + centerOffset(idx) + 'px)';
  }

  function setupInfinite() {
    var realCards = Array.from(track.querySelectorAll('.blog-card:not([data-clone])'));
    realTotal = realCards.length;
    if (realTotal === 0) return;

    // Prepend clone of last, append clone of first
    var cLast  = realCards[realTotal - 1].cloneNode(true); cLast.setAttribute('data-clone','last');
    var cFirst = realCards[0].cloneNode(true);             cFirst.setAttribute('data-clone','first');
    track.insertBefore(cLast, track.firstChild);
    track.appendChild(cFirst);

    // Start on the first real card (index 1 in cloned array)
    currentCloneIdx = 1;
    moveTo(currentCloneIdx, false);
  }

  function afterTransition() {
    // Detect if we landed on a clone and silently jump to the real card
    if (currentCloneIdx === 0) {
      // Landed on clone-of-last → snap to real last (index realTotal)
      currentCloneIdx = realTotal;
      moveTo(currentCloneIdx, false);
    } else if (currentCloneIdx === realTotal + 1) {
      // Landed on clone-of-first → snap to real first (index 1)
      currentCloneIdx = 1;
      moveTo(currentCloneIdx, false);
    }
    isAnimating = false;
  }

  function next() {
    if (isAnimating) return;
    isAnimating = true;
    currentCloneIdx++;
    moveTo(currentCloneIdx, true);
    track.addEventListener('transitionend', afterTransition, { once: true });
  }

  function prev() {
    if (isAnimating) return;
    isAnimating = true;
    currentCloneIdx--;
    moveTo(currentCloneIdx, true);
    track.addEventListener('transitionend', afterTransition, { once: true });
  }

  function onResize() {
    moveTo(currentCloneIdx, false);
  }

  function init() {
    var cards = track.querySelectorAll('.blog-card');
    if (cards.length === 0) { setTimeout(init, 50); return; }

    setupInfinite();

    nextBtn && nextBtn.addEventListener('click', next);
    prevBtn && prevBtn.addEventListener('click', prev);

    // Touch/swipe
    var tx = 0;
    carousel.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var dx = tx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) { dx > 0 ? next() : prev(); }
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    });

    window.addEventListener('resize', onResize);
  }

  // Wait for home-blog.js to inject cards
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
})();
