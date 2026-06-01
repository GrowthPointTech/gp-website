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
