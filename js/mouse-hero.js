/**
 * mouse-hero.js v3
 * — RAF pausable: solo corre cuando el hero es visible
 * — Empieza activo en el load (el hero siempre está visible al inicio)
 * — toFixed(1) en lugar de toFixed(2) (suficiente precisión)
 * — RAF también se auto-pausa cuando el mouse está quieto
 * — passive mousemove listener
 */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const light = document.getElementById('hero-mouse-light');
  if (!light) return;

  let isVisible = true; // el hero es visible al cargar la página
  let rafId     = null;
  let targetX   = 50, targetY = 50;
  let currentX  = 50, currentY = 50;
  const LERP    = 0.06;
  const IDLE_THRESHOLD = 0.08; // % — pausa cuando convergió

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Loop RAF — solo corre si hero visible ────
  function loop() {
    if (!isVisible) { rafId = null; return; } // pausa si hero off-screen

    const dx = targetX - currentX;
    const dy = targetY - currentY;
    currentX += dx * LERP;
    currentY += dy * LERP;

    light.style.setProperty('--mx', currentX.toFixed(1) + '%');
    light.style.setProperty('--my', currentY.toFixed(1) + '%');

    // Auto-pausa cuando convergió (evita RAF perpetuo)
    if (Math.abs(dx) < IDLE_THRESHOLD && Math.abs(dy) < IDLE_THRESHOLD) {
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rafId && isVisible) rafId = requestAnimationFrame(loop);
  }

  // mousemove: solo actualiza target vars (passive) + reactiva loop
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth)  * 100;
    targetY = (e.clientY / window.innerHeight) * 100;
    startLoop();
  }, { passive: true });

  // ── Visibilidad via ScrollTrigger ────────────
  function initVisibility() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Sin GSAP: siempre visible
      isVisible = true;
      light.style.opacity = '1';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Mostrar inmediatamente (hero visible al load)
    light.style.opacity = '1';

    ScrollTrigger.create({
      trigger: '#scroll-driver',
      start: 'top top',
      end: 'bottom top',
      // Cuando el scroll-driver empieza a salir por arriba → hero termina
      onLeave:      () => { isVisible = false; light.style.opacity = '0'; },
      onEnterBack:  () => { isVisible = true;  light.style.opacity = '1'; startLoop(); },
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisibility);
  } else {
    initVisibility();
  }

})();
