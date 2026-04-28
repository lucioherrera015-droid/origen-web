/**
 * mouse-hero.js
 * Luz ambiental en el hero que sigue al mouse via CSS vars.
 * Solo en desktop, desactivada en mobile y reduced-motion.
 */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const light    = document.getElementById('hero-mouse-light');
  const heroSection = document.getElementById('hero');

  if (!light || !heroSection) return;

  let visible = false;
  let rafId   = null;
  let targetX = 50, targetY = 50;
  let currentX = 50, currentY = 50;
  const LERP = 0.06; // suavizado — más bajo = más lag

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    currentX = lerp(currentX, targetX, LERP);
    currentY = lerp(currentY, targetY, LERP);
    light.style.setProperty('--mx', currentX.toFixed(2) + '%');
    light.style.setProperty('--my', currentY.toFixed(2) + '%');
    rafId = requestAnimationFrame(loop);
  }

  // Solo actualizar targetX/Y, el loop hace el resto
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth)  * 100;
    targetY = (e.clientY / window.innerHeight) * 100;
  });

  // Mostrar/ocultar la luz según si el hero es visible (ScrollTrigger)
  function initVisibility() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      light.style.opacity = '1';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#scroll-driver',
      start: 'top top',
      end: 'bottom top',
      onEnter: () => { light.style.opacity = '1'; visible = true; },
      onLeave: () => { light.style.opacity = '0'; visible = false; },
      onEnterBack: () => { light.style.opacity = '1'; visible = true; },
      onLeaveBack: () => { light.style.opacity = '0'; visible = false; },
    });
  }

  // Arrancar
  loop();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisibility);
  } else {
    initVisibility();
  }

})();
