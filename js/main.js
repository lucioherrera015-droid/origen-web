/**
 * main.js v2
 * Entry point: Lenis + nav progress + hamburger + anchor scroll.
 */
(function () {
  'use strict';

  // ── Lenis smooth scroll ──────────────────────
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration:      1.35,
      easing:        t => 1 - Math.pow(1 - t, 4),
      smoothWheel:   true,
      wheelMultiplier: 0.9,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }

    window.__lenis = lenis;
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

  // ── Smooth scroll a anclas ───────────────────
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (window.__lenis) {
          window.__lenis.scrollTo(target, { offset: -80, duration: 1.5 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Init ─────────────────────────────────────
  function init() {
    initLenis();
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
