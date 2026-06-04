(function () {
  var track    = document.getElementById('home-blog-grid');
  var viewport = track && track.closest('.blog-carousel__viewport');
  var carousel = track && track.closest('.blog-carousel');
  if (!track || !viewport || !carousel) return;

  var prevBtn = carousel.querySelector('.blog-carousel__arrow--prev');
  var nextBtn = carousel.querySelector('.blog-carousel__arrow--next');

  var GAP = 24; // px between cards
  var current = 0; // index into real cards (0-based)
  var isAnimating = false;

  function getCardWidth() {
    var first = track.querySelector('.blog-card');
    return first ? first.offsetWidth : 760;
  }

  function buildInfiniteTrack() {
    var realCards = Array.from(track.querySelectorAll('.blog-card:not([data-clone])'));
    var n = realCards.length;
    if (n === 0) return;

    // Clone last and first for infinite effect
    var cloneLast  = realCards[n - 1].cloneNode(true);
    var cloneFirst = realCards[0].cloneNode(true);
    cloneLast.setAttribute('data-clone', 'last');
    cloneFirst.setAttribute('data-clone', 'first');

    track.insertBefore(cloneLast, track.firstChild);
    track.appendChild(cloneFirst);

    // Jump to real first card (index 1 in cloned array)
    setPosition(1, false);
  }

  function allCards() {
    return Array.from(track.querySelectorAll('.blog-card'));
  }

  function realCount() {
    return track.querySelectorAll('.blog-card:not([data-clone])').length;
  }

  function setPosition(idx, animate) {
    var cardW = getCardWidth();
    var offset = -(idx * (cardW + GAP));
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform  = 'translateX(' + offset + 'px)';
  }

  function goTo(idx, animate) {
    if (isAnimating) return;
    isAnimating = true;
    setPosition(idx, animate !== false);

    track.addEventListener('transitionend', function onEnd() {
      track.removeEventListener('transitionend', onEnd);
      var n = realCount();
      var clonedIdx = idx; // idx in cloned array (0=cloneLast, 1..n=real, n+1=cloneFirst)

      if (clonedIdx === 0) {
        // We're on the clone-of-last — jump silently to real last
        setPosition(n, false);
        current = n - 1;
      } else if (clonedIdx === n + 1) {
        // We're on the clone-of-first — jump silently to real first
        setPosition(1, false);
        current = 0;
      } else {
        current = clonedIdx - 1;
      }
      isAnimating = false;
    }, { once: true });
  }

  function next() {
    var clonedCurrent = current + 1; // shift by 1 because of prepended clone
    goTo(clonedCurrent + 1, true);
  }

  function prev() {
    var clonedCurrent = current + 1;
    goTo(clonedCurrent - 1, true);
  }

  // Wait for cards to be rendered by home-blog.js
  function init() {
    var cards = track.querySelectorAll('.blog-card');
    if (cards.length === 0) { setTimeout(init, 50); return; }

    // Remove any old CSS carousel styles
    track.style.overflowX = 'visible';
    track.style.padding   = '0';
    track.style.margin    = '0';
    track.style.display   = 'flex';
    track.style.gap       = GAP + 'px';

    buildInfiniteTrack();

    prevBtn && prevBtn.addEventListener('click', function () { prev(); });
    nextBtn && nextBtn.addEventListener('click', function () { next(); });

    // Touch/swipe support
    var touchStartX = 0;
    viewport.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    }, { passive: true });
  }

  init();
})();
