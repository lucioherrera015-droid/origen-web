/**
 * tilt.js v2
 * — RAF throttle en mousemove (getBoundingClientRect cacheado)
 * — AbortController para cleanup limpio
 * — translate3d implícito via perspective transform
 */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards   = document.querySelectorAll('.blend-card');
  const section = document.querySelector('.section--blends');
  if (!cards.length) return;

  const MAX_TILT = 10;
  const RESET_TRANSFORM = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';

  cards.forEach(card => {
    // Crear glow
    const glow = document.createElement('div');
    glow.className = 'blend-card__glow';
    glow.setAttribute('aria-hidden', 'true');
    card.appendChild(glow);

    // AbortController por card
    const ac  = new AbortController();
    const sig = { signal: ac.signal };

    // Estado de la card
    let tiltRaf  = null;
    let rawX     = 0, rawY = 0;
    let cachedRect = null; // ← cache del rect (invalida en mouseleave)

    // Leer y cachear rect al entrar
    card.addEventListener('mouseenter', () => {
      cachedRect = card.getBoundingClientRect();

      // Fondo de sección
      if (section) {
        const rgb = getComputedStyle(card).getPropertyValue('--card-accent-rgb').trim() || '200,164,90';
        section.style.setProperty('--blend-bg', `rgba(${rgb}, 0.035)`);
      }
      card.style.transition = 'none'; // sin transición durante el tilt
    }, sig);

    card.addEventListener('mousemove', (e) => {
      if (!cachedRect) return;
      // Solo guardar valores crudos — el DOM write va al RAF
      rawX = (e.clientX - cachedRect.left) / cachedRect.width  - 0.5;
      rawY = (e.clientY - cachedRect.top)  / cachedRect.height - 0.5;

      if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
    }, { passive: true, ...sig });

    function applyTilt() {
      tiltRaf = null;
      const rotX = -rawY * MAX_TILT;
      const rotY =  rawX * MAX_TILT;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
      card.style.boxShadow = `0 20px 60px rgba(var(--card-accent-rgb, 200 164 90), 0.15)`;
      card.style.setProperty('--card-mx', `${(rawX + 0.5) * 100}%`);
      card.style.setProperty('--card-my', `${(rawY + 0.5) * 100}%`);
    }

    card.addEventListener('mouseleave', () => {
      // Cancelar RAF pendiente
      if (tiltRaf) { cancelAnimationFrame(tiltRaf); tiltRaf = null; }
      cachedRect = null;

      card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), box-shadow 0.7s ease';
      card.style.transform  = RESET_TRANSFORM;
      card.style.boxShadow  = 'none';

      if (section) section.style.setProperty('--blend-bg', 'transparent');
    }, sig);

    // Guardar cleanup en el elemento para poder destruirlo
    card.__tiltDestroy = () => ac.abort();
  });

})();
