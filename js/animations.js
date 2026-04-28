/**
 * animations.js v2
 * — Word split animado por palabra (GSAP, sin SplitText plugin)
 * — Clip-path reveals
 * — Contadores animados
 * — Parallax multi-velocidad
 * — Separadores animados
 * — Itálica animada (skew)
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop     = window.matchMedia('(min-width: 1024px)').matches;

  // ── 1. WORD SPLIT ────────────────────────────
  /**
   * Divide el texto de un elemento en spans por palabra.
   * Preserva los <em> y <br> ya existentes.
   */
  function splitIntoWords(el) {
    // Clonar para trabajar sobre nodos
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const nodes  = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        const frag  = document.createDocumentFragment();
        words.forEach(word => {
          if (!word.trim()) {
            frag.appendChild(document.createTextNode(word));
          } else {
            const outer = document.createElement('span');
            outer.className = 'word';
            outer.style.display = 'inline-block';
            outer.style.overflow = 'hidden';
            outer.style.verticalAlign = 'bottom';
            const inner = document.createElement('span');
            inner.className = 'word__inner';
            inner.style.display = 'inline-block';
            inner.textContent = word;
            outer.appendChild(inner);
            frag.appendChild(outer);
          }
        });
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  // Aplicar split + animación GSAP a un elemento titular
  function animateHeading(el, trigger, stagger = 0.07) {
    if (!el) return;

    if (reducedMotion) {
      el.style.opacity = '1';
      return;
    }

    // Marcar como invisible antes del split
    el.style.opacity = '0';
    splitIntoWords(el);
    el.style.opacity = '1';

    const inners = el.querySelectorAll('.word__inner');
    if (!inners.length) return;

    if (typeof gsap === 'undefined') return;

    gsap.from(inners, {
      yPercent: 105,
      opacity:  0,
      duration: 1.0,
      ease:     'power3.out',
      stagger:  stagger,
      scrollTrigger: {
        trigger: trigger || el,
        start:   'top 88%',
      },
    });
  }

  // ── 2. CLIP-PATH REVEALS ─────────────────────
  function initClipReveals() {
    if (reducedMotion) {
      document.querySelectorAll('[data-reveal="clip"]').forEach(el => {
        el.style.clipPath = 'inset(0% 0 0 0)';
        el.style.opacity  = '1';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('[data-reveal="clip"]').forEach(el => observer.observe(el));
  }

  // ── 2b. CLIP-PATH HORIZONTAL REVEALS ──────────
  function initClipHReveals() {
    const els = document.querySelectorAll('[data-reveal="clip-h"], [data-reveal="clip-hr"]');
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => obs.observe(el));
  }

  // ── 3. FADE REVEALS (no-hero) ─────────────────
  function initFadeReveals() {
    const selector = '[data-reveal]:not([data-reveal="clip"]):not(#hero-content [data-reveal])';

    if (reducedMotion) {
      document.querySelectorAll(selector).forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  }

  // ── 4. CONTADORES ANIMADOS ────────────────────
  function animateCounter(el) {
    if (reducedMotion) return; // valor ya está en el HTML

    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    let start      = null;

    function ease(t) { return 1 - Math.pow(1 - t, 3); } // ease-out cubic

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value    = Math.floor(ease(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => {
      if (!reducedMotion) el.textContent = '0' + (el.dataset.suffix || '');
      observer.observe(el);
    });
  }

  // ── 5. PARALLAX ──────────────────────────────
  function initParallax() {
    if (!isDesktop || reducedMotion || typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Reducido a elementos que realmente existen y tienen impacto visual
    // scrub:2 = más suave, menos frecuencia de cálculo que scrub:true
    const parallaxItems = [
      { selector: '.origen__deco',   yPercent: -15 },
      { selector: '.cta__bg-glow',   yPercent:  20 },
    ];

    parallaxItems.forEach(({ selector, yPercent }) => {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;
      els.forEach(el => {
        const section = el.closest('section') || document.body;
        gsap.to(el, {
          yPercent,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start:   'top bottom',
            end:     'bottom top',
            scrub:   2, // más suave = menos updates por frame
            onEnter:     () => { el.style.willChange = 'transform'; },
            onLeave:     () => { el.style.willChange = 'auto'; },
            onEnterBack: () => { el.style.willChange = 'transform'; },
            onLeaveBack: () => { el.style.willChange = 'auto'; },
          },
        });
      });
    });
  }

  // ── 5b. TIMELINE FILL ────────────────────────
  function initTimelineFill() {
    const fill = document.getElementById('timeline-fill');
    if (!fill || reducedMotion || typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(fill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: 1,
      },
    });
  }

  // ── 6. SEPARADORES ANIMADOS ───────────────────
  function initDividers() {
    const dividers = document.querySelectorAll('.section-divider__line');
    if (!dividers.length) return;

    if (reducedMotion) {
      dividers.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    dividers.forEach(el => observer.observe(el));
  }

  // ── 7. ITALIC SKEW ANIMATION ─────────────────
  function initItalicSkew() {
    if (reducedMotion || typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.section__title em, .cta__title em').forEach(em => {
      gsap.fromTo(em,
        { skewX: -6, opacity: 0.6 },
        {
          skewX: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: em,
            start: 'top 85%',
          },
        }
      );
    });
  }

  // ── INIT ─────────────────────────────────────
  function init() {
    if (typeof gsap !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    // Headlines con word split
    const headlines = [
      { sel: '#origen-title',   stagger: 0.065 },
      { sel: '#blends-title',   stagger: 0.065 },
      { sel: '#proceso-title',  stagger: 0.065 },
      { sel: '.cta__title',     stagger: 0.08  },
    ];
    headlines.forEach(({ sel, stagger }) => {
      const el = document.querySelector(sel);
      if (el) animateHeading(el, el.closest('section'), stagger);
    });

    initClipReveals();
    initClipHReveals();
    initFadeReveals();
    initCounters();
    initParallax();
    initTimelineFill();
    initDividers();
    initItalicSkew();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
