/**
 * mouse-hero.js v2
 * — RAF pausable: solo corre cuando el hero es visible
 * — toFixed(1) en lugar de toFixed(2) (suficiente precisión)
 * — passive mousemove listener
 */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const light = document.getElementById('hero-mouse-light');
  if (!light) return;

  let isVisible = false;
  let rafId     = null;
  let targetX   = 50, targetY = 50;
  let currentX  = 50, currentY = 50;
  const LERP    = 0.06;

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Loop RAF — solo corre si hero visible ────
  function loop() {
    if (!isVisible) { rafId = null; return; } // auto-pausa

    currentX = lerp(currentX, targetX, LERP);
    currentY = lerp(currentY, targetY, LERP);
    // toFixed(1) — 1 decimal es suficiente para posición %
    light.style.setProperty('--mx', currentX.toFixed(1) + '%');
    light.style.setProperty('--my', currentY.toFixed(1) + '%');
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  // mousemove: solo actualiza target vars (passive)
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth)  * 100;
    targetY = (e.clientY / window.innerHeight) * 100;
  }, { passive: true });

  // ── Visibilidad via ScrollTrigger ────────────
  function initVisibility() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      isVisible = true;
      light.style.opacity = '1';
      startLoop();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#scroll-driver',
      start: 'top top',
      end: 'bottom top',
      onEnter:      () => { isVisible = true;  light.style.opacity = '1'; startLoop(); },
      onLeave:      () => { isVisible = false; light.style.opacity = '0'; },
      onEnterBack:  () => { isVisible = true;  light.style.opacity = '1'; startLoop(); },
      onLeaveBack:  () => { isVisible = false; light.style.opacity = '0'; },
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisibility);
  } else {
    initVisibility();
  }

})();
