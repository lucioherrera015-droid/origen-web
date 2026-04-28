/**
 * cursor.js v3
 * — RAF loop se pausa automáticamente cuando el mouse está quieto
 * — Solo corre cuando hay movimiento real (mousemove activa loop)
 * — translate3d para forzar GPU layer (sin repaints)
 * — AbortController para cleanup limpio
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
  const IDLE_THRESHOLD = 0.05; // px — deja de correr cuando ring está "cerca"

  let mouseX = -200, mouseY = -200;
  let ringX  = -200, ringY  = -200;
  let rafId  = null;
  let isVisible = false;

  // ── Loop RAF — se auto-pausa cuando ring convergió ──
  function loop() {
    // Dot: sigue exacto (translate3d para GPU composite layer)
    dot.style.transform  = `translate3d(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px, 0)`;

    // Ring: lerp suave
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;
    ringX += dx * LERP;
    ringY += dy * LERP;
    ring.style.transform = `translate3d(${ringX - RING_HALF}px, ${ringY - RING_HALF}px, 0)`;

    // Auto-pausa cuando el ring llegó al destino (evita RAF perpetuo)
    if (Math.abs(dx) < IDLE_THRESHOLD && Math.abs(dy) < IDLE_THRESHOLD) {
      rafId = null; // loop finaliza
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  // ── AbortController para cleanup ─────────────
  const ac  = new AbortController();
  const sig = { signal: ac.signal };

  // mousemove: SOLO actualiza variables + activa loop si estaba pausado
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      dot.classList.remove('hidden');
      ring.classList.remove('hidden');
    }
    startLoop(); // reactiva el loop si estaba pausado por idle
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

  // ── No arrancar loop hasta el primer mousemove ─
  // (antes iniciaba inmediatamente — ahora espera input)

  window.__cursor = {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      ac.abort();
      dot.remove();
      ring.remove();
    }
  };

})();
