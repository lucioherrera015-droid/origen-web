/**
 * tilt.js
 * Tilt 3D en las cards de blends + glow interno que sigue al mouse.
 * Solo en desktop (hover:hover + pointer:fine).
 */
(function () {
  'use strict';

  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isDesktop || reducedMotion) return;

  const cards   = document.querySelectorAll('.blend-card');
  const section = document.querySelector('.section--blends');

  if (!cards.length) return;

  const MAX_TILT   = 10;   // grados máximos de rotación
  const TRANSITION_OUT = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';

  cards.forEach(card => {
    // Crear elemento de glow interno
    const glow = document.createElement('div');
    glow.className = 'blend-card__glow';
    glow.setAttribute('aria-hidden', 'true');
    card.appendChild(glow);

    // Obtener color de acento del blend
    const accentRgb = getComputedStyle(card)
      .getPropertyValue('--card-accent-rgb')
      .trim() || '200,164,90';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 a 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const rotX = -y * MAX_TILT;
      const rotY =  x * MAX_TILT;

      // Aplicar tilt
      card.style.transition = 'box-shadow 0.4s ease';
      card.style.transform  = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
      card.style.boxShadow  = `0 20px 60px rgba(${accentRgb}, 0.15)`;

      // Actualizar posición del glow
      const glowX = (x + 0.5) * 100;
      const glowY = (y + 0.5) * 100;
      card.style.setProperty('--card-mx', `${glowX}%`);
      card.style.setProperty('--card-my', `${glowY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.7s ease';
      card.style.transform  = TRANSITION_OUT;
      card.style.boxShadow  = 'none';
    });

    card.addEventListener('mouseenter', () => {
      // Cambiar fondo de sección sutilmente
      if (section) {
        const rgb = getComputedStyle(card).getPropertyValue('--card-accent-rgb').trim() || '200,164,90';
        section.style.setProperty('--blend-bg', `rgba(${rgb}, 0.035)`);
      }
    });

    card.addEventListener('mouseleave', () => {
      if (section) section.style.setProperty('--blend-bg', 'transparent');
    });
  });

})();
