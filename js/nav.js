// Mobile navigation — full-screen overlay matching live site
document.addEventListener('DOMContentLoaded', function () {
  var nav    = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  var links  = document.querySelector('.nav__links');

  if (!toggle || !links) return;

  function openNav() {
    nav.classList.add('nav--open');
    links.classList.add('active');
    toggle.innerHTML = '&#10005;'; // ✕
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    document.body.classList.add('nav-open');
  }

  function closeNav() {
    nav.classList.remove('nav--open');
    links.classList.remove('active');
    toggle.innerHTML = '&#9776;'; // ☰
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Toggle navigation');
    document.body.classList.remove('nav-open');
  }

  toggle.addEventListener('click', function () {
    links.classList.contains('active') ? closeNav() : openNav();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('active')) closeNav();
  });

  // Services dropdown — mobile tap to expand sub-links
  var dropdownItems = document.querySelectorAll('.nav__dropdown');
  dropdownItems.forEach(function (item) {
    var dropToggle = item.querySelector('.nav__dropdown-toggle');
    if (!dropToggle) return;
    dropToggle.addEventListener('click', function (e) {
      if (window.innerWidth < 768) {
        e.preventDefault();
        item.classList.toggle('nav__dropdown--open');
      }
    });
  });
});
