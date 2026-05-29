document.addEventListener('DOMContentLoaded', function () {
  // Color stops per section — [R, G, B]
  var stops = [
    { el: document.querySelector('.hero'),         bg: [8, 15, 31],    text: [255, 255, 255] },
    { el: document.querySelector('.about-story'),  bg: [255, 255, 255], text: [8, 15, 31]    },
    { el: document.querySelector('.about-bio'),    bg: [8, 15, 31],    text: [255, 255, 255] },
    { el: document.querySelector('.about-millie'), bg: [228, 253, 178], text: [8, 15, 31]    }
  ].filter(function (s) { return s.el; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpColor(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  // Smooth S-curve easing
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function update() {
    var viewMid = window.scrollY + window.innerHeight * 0.5;
    var from = stops[0], to = stops[0], t = 0;

    for (var i = 0; i < stops.length - 1; i++) {
      var s1 = stops[i], s2 = stops[i + 1];
      var y1 = s1.el.offsetTop + s1.el.offsetHeight * 0.5;
      var y2 = s2.el.offsetTop + s2.el.offsetHeight * 0.5;

      if (viewMid <= y1) { from = to = s1; t = 0; break; }
      if (i === stops.length - 2 && viewMid >= y2) { from = to = s2; t = 0; break; }

      if (viewMid >= y1 && viewMid <= y2) {
        from = s1;
        to   = s2;
        t    = smoothstep((viewMid - y1) / (y2 - y1));
        break;
      }
    }

    var bg   = lerpColor(from.bg,   to.bg,   t);
    var text = lerpColor(from.text, to.text, t);

    document.documentElement.style.setProperty('--scroll-bg',   'rgb(' + bg.join(',') + ')');
    document.documentElement.style.setProperty('--scroll-text', 'rgb(' + text.join(',') + ')');
  }

  var lastScrollY = window.scrollY;
  var scrollDir = 1;

  window.addEventListener('scroll', function () {
    scrollDir = window.scrollY < lastScrollY ? -1 : 1;
    lastScrollY = window.scrollY;
    update();
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Hero content — vertical direction-aware sweep
  var heroContainer = document.querySelector('.hero .container');
  if (heroContainer) {
    var heroObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        var fromTop = scrollDir === -1;
        heroContainer.classList.add('no-transition');
        heroContainer.classList.remove('is-visible');
        heroContainer.classList.toggle('from-top', fromTop);
        heroContainer.getBoundingClientRect();
        heroContainer.classList.remove('no-transition');
        setTimeout(function () {
          heroContainer.classList.add('is-visible');
        }, 350);
      } else {
        // Scrolling down — sweep up and away; scrolling up — drop back down
        heroContainer.classList.toggle('from-top', scrollDir === 1);
        heroContainer.classList.remove('is-visible');
      }
    }, { threshold: 0.2 });
    heroObserver.observe(document.querySelector('.hero'));
  }

  // Grid column swipe-in animations
  var columnPairs = [
    { grid: '.about-story__grid',  left: '.about-story__content',  right: null               },
    { grid: '.about-bio__grid',    left: '.about-bio__photo',      right: '.about-bio__content' },
    { grid: '.about-millie__grid', left: '.about-millie__content', right: '.about-millie__photos' }
  ];

  columnPairs.forEach(function (pair) {
    var grid = document.querySelector(pair.grid);
    if (!grid) return;

    var targets = [pair.left, pair.right].filter(Boolean).map(function (sel) {
      return grid.querySelector(sel);
    }).filter(Boolean);

    var colObserver = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      targets.forEach(function (el) {
        el.classList.toggle('is-visible', visible);
      });
    }, { threshold: 0.15 });

    colObserver.observe(grid);
  });

  // Value cards — direction-aware sweep
  var valuesList = document.querySelector('.about-values__list');
  if (valuesList) {
    var valueItems = Array.prototype.slice.call(valuesList.querySelectorAll('.about-values__item'));

    var valuesObserver = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;

      if (visible) {
        var fromBottom = scrollDir === -1;

        // Reposition without transition so the user never sees the jump
        valueItems.forEach(function (item) {
          item.classList.add('no-transition');
          item.classList.remove('is-visible');
          item.classList.toggle('from-bottom', fromBottom);
        });

        // Set stagger direction before reflow
        valuesList.classList.toggle('reverse-stagger', fromBottom);

        // Force reflow so the repositioned state is painted
        valuesList.getBoundingClientRect();

        // Animate in — extra delay when arriving from below
        var delay = fromBottom ? 400 : 0;
        setTimeout(function () {
          valueItems.forEach(function (item) {
            item.classList.remove('no-transition');
            item.classList.add('is-visible');
          });
        }, delay);
      } else {
        valueItems.forEach(function (item) {
          item.classList.remove('is-visible', 'from-bottom');
        });
      }
    }, { threshold: 0.2 });

    valuesObserver.observe(valuesList);
  }
});
