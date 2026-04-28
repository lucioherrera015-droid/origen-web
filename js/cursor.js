/**
 * cursor.js
 * Custom cursor: dot + ring con lag suave.
 * Solo en dispositivos con mouse (hover:hover + pointer:fine).
 */
(function () {
  'use strict';

  // No inicializar en touch/mobile
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Crear elementos ──────────────────────────
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id  = 'cursor-dot';
  ring.id = 'cursor-ring';
  dot.classList.add('hidden');
  ring.classList.add('hidden');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // ── Estado ───────────────────────────────────
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let rafId  = null;
  const LERP = 0.11; // factor de suavizado del ring (0 = sin lag, 1 = sin movimiento)

  // ── Posicionar dot inmediatamente ────────────
  function setDot(x, y) {
    dot.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
  }

  // ── Loop de animación para el ring ───────────
  function loop() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    rafId = requestAnimationFrame(loop);
  }

  // ── Eventos de mouse ─────────────────────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDot(mouseX, mouseY);

    if (dot.classList.contains('hidden')) {
      dot.classList.remove('hidden');
      ring.classList.remove('hidden');
    }
  });

  document.addEventListener('mouseenter', () => {
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
  });

  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  });

  document.addEventListener('mousedown', () => {
    dot.classList.add('is-clicking');
    ring.classList.add('is-clicking');
  });

  document.addEventListener('mouseup', () => {
    dot.classList.remove('is-clicking');
    ring.classList.remove('is-clicking');
  });

  // ── Hover states en elementos interactivos ───
  const HOVER_SELECTORS = [
    'a',
    'button',
    '.blend-card',
    '.process__item',
    '.nav__logo',
    '[data-cursor-hover]',
  ].join(',');

  const LINK_SELECTORS = ['a', 'button'].join(',');

  // Delegación de eventos para mejor performance
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(HOVER_SELECTORS);
    if (!target) return;

    ring.classList.add('is-hovering');
    if (target.matches(LINK_SELECTORS)) {
      ring.classList.add('is-link');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(HOVER_SELECTORS);
    if (!target) return;

    const relatedTarget = e.relatedTarget;
    // Solo quitar la clase si no seguimos dentro del mismo elemento
    if (!target.contains(relatedTarget)) {
      ring.classList.remove('is-hovering', 'is-link');
    }
  });

  // ── Arrancar loop ────────────────────────────
  loop();

  // Exponer para poder destruirlo si fuera necesario
  window.__cursor = {
    destroy() {
      cancelAnimationFrame(rafId);
      dot.remove();
      ring.remove();
    }
  };

})();
