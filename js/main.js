/**
 * main.js v3
 * Entry point: scroll nativo (sin Lenis) + nav progress + hamburger + anchor scroll.
 * Lenis eliminado — causaba trabado del wheel event en desktop.
 * GSAP/ScrollTrigger siguen funcionando normalmente con scroll nativo.
 */
(function () {
  'use strict';

  // ── GSAP ScrollTrigger: usar scroll nativo ───
  // Sin Lenis, ScrollTrigger escucha el scroll nativo directamente.
  // No necesitamos configuración especial — GSAP maneja esto por defecto.
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    // lagSmoothing(0) evita que GSAP "suavice" el ticker internamente
    // lo que podría causar desfase entre scroll nativo y animaciones
    gsap.ticker.lagSmoothing(0);
  }

  // ── Nav: blur al scrollear ───────────────────
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:10px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(([entry]) => {
      nav.classList.toggle('scrolled', !entry.isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  // ── Nav progress bar ────────────────────────
  function initNavProgress() {
    const bar = document.getElementById('nav-progress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── Hamburger menu ───────────────────────────
  function initHamburger() {
    const btn   = document.getElementById('nav-hamburger');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen);
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Smooth scroll a anclas (scroll nativo) ───
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        // Scroll nativo con offset para el nav fijo
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  // ── Init ─────────────────────────────────────
  function init() {
    initGSAP();
    initNav();
    initNavProgress();
    initHamburger();
    initAnchorLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
