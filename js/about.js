// Fade-in on scroll — stagger siblings within the same parent
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const siblings = Array.from(el.parentElement.querySelectorAll('.about-fade'));
      const index = siblings.indexOf(el);
      el.style.animationDelay = (index * 0.15) + 's';
      el.classList.add('is-visible');
      observer.unobserve(el);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.about-fade').forEach(el => observer.observe(el));

const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      slideObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.about-slide-up').forEach(el => slideObserver.observe(el));

document.querySelectorAll('.about-team__toggle-btn').forEach(btn => {
  const bioId = btn.getAttribute('aria-controls');
  const bio = document.getElementById(bioId);
  const card = btn.closest('.about-team__card');
  if (!bio || !card) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      bio.style.height = bio.scrollHeight + 'px';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { bio.style.height = '0'; });
      });
      bio.addEventListener('transitionend', () => {
        bio.style.height = '0';
        card.classList.remove('is-expanded');
      }, { once: true });
      btn.setAttribute('aria-expanded', 'false');
    } else {
      card.classList.add('is-expanded');
      btn.setAttribute('aria-expanded', 'true');
      const h = bio.scrollHeight;
      bio.style.height = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { bio.style.height = h + 'px'; });
      });
      bio.addEventListener('transitionend', () => {
        bio.style.height = 'auto';
      }, { once: true });
    }
  });
});
