document.querySelectorAll('.about-team__title-row').forEach(btn => {
  const bioId = btn.getAttribute('aria-controls');
  const bio = document.getElementById(bioId);
  if (!bio) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      bio.style.height = bio.scrollHeight + 'px';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { bio.style.height = '0'; });
      });
      bio.addEventListener('transitionend', () => {
        bio.style.height = '0';
      }, { once: true });
      btn.setAttribute('aria-expanded', 'false');
    } else {
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
