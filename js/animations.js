/**
 * animations.js
 * Scroll-reveal con IntersectionObserver para todas las secciones
 * excepto el hero (que se maneja en scroll-animation.js).
 */

(function () {
  'use strict';

  // Excluimos los elementos dentro de #hero-content (los maneja scroll-animation.js)
  const SELECTOR = '[data-reveal]:not(#hero-content [data-reveal])';

  function initReveal() {
    const elements = document.querySelectorAll(SELECTOR);
    if (!elements.length) return;

    // Saltar animaciones si prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

})();
