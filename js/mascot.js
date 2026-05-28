(function () {
  var mascot = document.querySelector('.mascot');
  if (!mascot) return;

  var footer = document.querySelector('.footer');
  if (!footer) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        mascot.classList.add('mascot--visible');
      } else {
        mascot.classList.remove('mascot--visible');
      }
    });
  }, { threshold: 0.2 });

  observer.observe(footer);
}());
