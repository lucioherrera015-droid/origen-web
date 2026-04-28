/**
 * cursor.js v2
 * — translate3d para forzar GPU layer (sin repaints)
 * — RAF unificado: mousemove solo escribe vars, loop RAF aplica
 * — AbortController para cleanup limpio de todos los listeners
 */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id  = 'cursor-dot';
  ring.id = 'cursor-ring';
  dot.classList.add('hidden');
  ring.classList.add('hidden');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // Pre-calcular mitades (evita recalcular en cada frame)
  const DOT_HALF  = 3;   // mitad del dot (5px / 2 ≈ 3)
  const RING_HALF = 19;  // mitad del ring (38px / 2)
  const LERP = 0.11;

  let mouseX = -200, mouseY = -200;
  let ringX  = -200, ringY  = -200;
  let rafId  = null;
  let isVisible = false;

  // ── Loop RAF unificado ───────────────────────
  function loop() {
    // Dot: sigue exacto (translate3d para GPU composite layer)
    dot.style.transform  = `translate3d(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px, 0)`;

    // Ring: lerp suave
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate3d(${ringX - RING_HALF}px, ${ringY - RING_HALF}px, 0)`;

    rafId = requestAnimationFrame(loop);
  }

  // ── AbortController para cleanup ─────────────
  const ac  = new AbortController();
  const sig = { signal: ac.signal };

  // mousemove: SOLO actualiza variables (sin DOM writes)
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      dot.classList.remove('hidden');
      ring.classList.remove('hidden');
    }
  }, { passive: true, ...sig });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
  }, sig);

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  }, sig);

  document.addEventListener('mousedown', () => {
    dot.classList.add('is-clicking');
    ring.classList.add('is-clicking');
  }, sig);

  document.addEventListener('mouseup', () => {
    dot.classList.remove('is-clicking');
    ring.classList.remove('is-clicking');
  }, sig);

  // ── Hover states (delegación) ─────────────────
  const HOVER_SEL = 'a, button, .blend-card, .process__item, .timeline__img-wrap, .nav__logo, [data-cursor-hover]';
  const LINK_SEL  = 'a, button';

  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest(HOVER_SEL);
    if (!t) return;
    ring.classList.add('is-hovering');
    if (t.matches(LINK_SEL)) ring.classList.add('is-link');
  }, sig);

  document.addEventListener('mouseout', (e) => {
    const t = e.target.closest(HOVER_SEL);
    if (!t || t.contains(e.relatedTarget)) return;
    ring.classList.remove('is-hovering', 'is-link');
  }, sig);

  // ── Arrancar ──────────────────────────────────
  loop();

  window.__cursor = {
    destroy() {
      cancelAnimationFrame(rafId);
      ac.abort();
      dot.remove();
      ring.remove();
    }
  };

})();
