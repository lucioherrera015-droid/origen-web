/**
 * scroll-animation.js v3
 * — Canvas hero con frames del video sincronizados al scroll.
 * — RAF pausable: canvas deja de dibujar cuando está off-screen o con opacity 0
 * — Sin forced reflows en el loop de render
 * — Dependencias: GSAP + ScrollTrigger (cargados antes via CDN)
 */

(function () {
  'use strict';

  // En mobile cargamos 60 frames (cada ~2.5 del set original de 150)
  const IS_MOBILE    = window.innerWidth < 768;
  const TOTAL_FRAMES = IS_MOBILE ? 60 : 150;
  const PRELOAD_MIN  = IS_MOBILE ? 15 : 30;
  const FRAME_PATH   = 'frames/frame_';
  const FRAME_EXT    = '.webp';

  const canvas  = document.getElementById('hero-canvas');
  const ctx     = canvas ? canvas.getContext('2d') : null;
  const loaderBar   = document.getElementById('loader-bar');
  const loaderCount = document.getElementById('loader-count');
  const loaderEl    = document.getElementById('loader');

  if (!canvas || !ctx) return;

  // ── Estado ──────────────────────────────────
  let frames       = [];
  let loadedCount  = 0;
  let currentFrame = 0;
  let rafId        = null;
  let canvasW      = 0;
  let canvasH      = 0;
  let scrollTriggerInstance = null;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Control de pausa — canvas solo dibuja cuando es visible
  let heroVisible  = true;   // controlado por IntersectionObserver
  let pendingFrame = -1;     // frame que espera ser dibujado

  // ── Resize del canvas ────────────────────────
  function resizeCanvas() {
    canvasW = canvas.width  = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
    drawFrame(currentFrame);
  }

  // ── Dibujo de frame (object-fit: cover) ──────
  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.clearRect(0, 0, canvasW, canvasH);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  // ── Solicitar frame via RAF (pausable) ────────
  function requestDraw(index) {
    if (!heroVisible) {
      // Guardar el frame pendiente — se dibujará cuando sea visible de nuevo
      pendingFrame = index;
      return;
    }
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      drawFrame(index);
    });
  }

  // ── Actualizar barra de carga ────────────────
  function updateLoader(count) {
    const pct = Math.round((count / TOTAL_FRAMES) * 100);
    if (loaderBar)   loaderBar.style.width = pct + '%';
    if (loaderCount) loaderCount.textContent = pct + '%';
  }

  // ── Esconder loader y arrancar scroll ────────
  function hideLoader() {
    if (loaderEl) loaderEl.classList.add('hidden');
    document.body.style.overflow = '';
    initScrollTrigger();
    revealHeroContent();
  }

  // ── Revelar contenido del hero ────────────────
  function revealHeroContent() {
    const heroEls = document.querySelectorAll('#hero-content [data-reveal]');
    heroEls.forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), 150 + i * 120);
    });
  }

  // ── Inicializar GSAP ScrollTrigger ───────────
  function initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ORIGEN: GSAP/ScrollTrigger no disponibles.');
      drawFrame(0);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Si prefiere motion reducido: mostrar primer frame fijo
    if (reducedMotion) {
      drawFrame(0);
      return;
    }

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: '#scroll-driver',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: function (self) {
        const idx = Math.min(
          Math.floor(self.progress * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1
        );
        if (idx !== currentFrame) {
          currentFrame = idx;
          requestDraw(currentFrame);
        }
      },
    });

    // Fade out del hero content al scrollear
    gsap.to('#hero-content', {
      opacity: 0,
      y: -30,
      ease: 'power2.in',
      scrollTrigger: {
        trigger: '#scroll-driver',
        start: 'top top',
        end: '25% top',
        scrub: true,
      },
    });

    // Fade out del canvas overlay al terminar
    // onUpdate de opacidad para pausar el canvas cuando ya no se ve
    gsap.to(['#hero-canvas', '.hero__gradient-overlay'], {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#scroll-driver',
        start: '80% top',
        end: 'bottom top',
        scrub: true,
        onUpdate: function (self) {
          // Cuando el canvas está casi invisible, pausar el RAF
          heroVisible = self.progress < 0.95;
          // Si se hace visible de nuevo y hay un frame pendiente, dibujarlo
          if (heroVisible && pendingFrame >= 0) {
            requestDraw(pendingFrame);
            pendingFrame = -1;
          }
        },
        onLeave:     () => { heroVisible = false; },
        onEnterBack: () => {
          heroVisible = true;
          if (pendingFrame >= 0) {
            requestDraw(pendingFrame);
            pendingFrame = -1;
          }
        },
      },
    });
  }

  // ── Fallback: sin frames, mostrar fondo CSS ──
  function activateFallback() {
    canvas.classList.add('no-frames');
    if (loaderEl) loaderEl.classList.add('hidden');
    document.body.style.overflow = '';
    revealHeroContent();
    // Sin ScrollTrigger para el canvas, pero sí para el resto
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to('#hero-content', {
        opacity: 0,
        y: -30,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: '#scroll-driver',
          start: 'top top',
          end: '25% top',
          scrub: true,
        },
      });
    }
  }

  // ── IntersectionObserver — pausa canvas cuando sale del viewport ──
  function initCanvasVisibility() {
    const heroSection = document.getElementById('hero');
    if (!heroSection || typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && pendingFrame >= 0) {
          requestDraw(pendingFrame);
          pendingFrame = -1;
        }
        // Si sale del viewport, cancelar RAF pendiente
        if (!heroVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0 });

    obs.observe(heroSection);
  }

  // ── Precargar frames ─────────────────────────
  function preloadFrames() {
    let firstBatchReady = false;

    // Bloquear scroll durante la carga inicial
    document.body.style.overflow = 'hidden';

    // Dibujar primer frame de inmediato cuando cargue
    function onFirstFrame(img) {
      frames[0] = img;
      resizeCanvas();
      drawFrame(0);
    }

    const firstImg = new Image();
    firstImg.onload  = () => onFirstFrame(firstImg);
    firstImg.onerror = () => { /* continuar */ };
    firstImg.src = getFrameSrc(1);

    // Cargar todos en paralelo
    let errCount = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      (function (idx) {
        const img = new Image();
        img.onload = function () {
          frames[idx - 1] = img;
          loadedCount++;
          updateLoader(loadedCount);

          // Primer batch listo → esconder loader
          if (!firstBatchReady && loadedCount >= PRELOAD_MIN) {
            firstBatchReady = true;
            hideLoader();
          }
          // Todos cargados
          if (loadedCount + errCount === TOTAL_FRAMES) {
            updateLoader(TOTAL_FRAMES);
          }
        };
        img.onerror = function () {
          errCount++;
          loadedCount++; // contamos como "intentado"
          updateLoader(loadedCount);
          if (!firstBatchReady && loadedCount >= PRELOAD_MIN) {
            firstBatchReady = true;
            // Si hay demasiados errores, activar fallback
            if (errCount > TOTAL_FRAMES * 0.8) {
              activateFallback();
            } else {
              hideLoader();
            }
          }
        };
        img.src = getFrameSrc(idx);
        frames[idx - 1] = img; // reservar slot
      })(i);
    }

    // Safety timeout: si tras 8s no cargó el mínimo, fallback
    setTimeout(() => {
      if (!firstBatchReady) {
        firstBatchReady = true;
        if (loadedCount < 5) {
          activateFallback();
        } else {
          hideLoader();
        }
      }
    }, 8000);
  }

  function pad(n) {
    return String(n).padStart(3, '0');
  }

  // Mapea un índice 1-TOTAL_FRAMES al frame real 1-150
  function getFrameSrc(i) {
    const realIdx = IS_MOBILE
      ? Math.round(1 + (i - 1) * (149 / 59)) // 1-60 → 1-150 uniforme
      : i;
    return FRAME_PATH + pad(realIdx) + FRAME_EXT;
  }

  // ── Init ─────────────────────────────────────
  function init() {
    resizeCanvas();
    initCanvasVisibility(); // Pausar canvas cuando sale del viewport

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    });

    preloadFrames();
  }

  // Esperar a que GSAP esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
