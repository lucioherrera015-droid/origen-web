/**
 * store.js — ORIGEN Tienda
 * Módulos: ProductData, CartStore, ShopUI, ModalUI, CartUI, NewsletterUI
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════
     1. PRODUCT DATA
  ════════════════════════════════════════════ */
  const PRODUCTS = [
    {
      id: 'volcanico', category: 'blend',
      name: 'Volcánico', badge: 'Intenso',
      notes: 'Cacao amargo · Tabaco · Cuerpo denso',
      desc: 'Notas de cacao amargo y tabaco. Cuerpo denso, final prolongado. Para los que toman el café en serio.',
      intensity: 5,
      variants: [{ weight: '250g', price: 4200 }, { weight: '500g', price: 7500 }],
      img: 'img/prod-volcanico.jpg',
    },
    {
      id: 'serrania', category: 'blend',
      name: 'Serranía', badge: 'Destacado',
      notes: 'Floral · Cítrico · Acidez brillante',
      desc: 'Floral, cítrico, con acidez brillante. Un perfil limpio que se disfruta sin azúcar.',
      intensity: 3,
      variants: [{ weight: '250g', price: 3800 }, { weight: '500g', price: 6900 }],
      img: 'img/prod-serrania.jpg',
    },
    {
      id: 'nocturno', category: 'blend',
      name: 'Nocturno', badge: 'Suave',
      notes: 'Caramelo · Nuez · Toque ahumado',
      desc: 'Caramelo, nuez y un toque ahumado. Suave pero con presencia. Ideal para cerrar el día.',
      intensity: 4,
      variants: [{ weight: '250g', price: 3500 }, { weight: '500g', price: 6200 }],
      img: 'img/prod-nocturno.jpg',
    },
    {
      id: 'colombia', category: 'single',
      name: 'Colombia Huila', badge: 'Single Origin',
      notes: 'Fruta madura · Dulzura natural · Cuerpo medio',
      desc: 'Dulzura natural, cuerpo medio, notas de fruta madura. Procesado en húmedo, altura 1.700 m.',
      intensity: 3,
      variants: [{ weight: '250g', price: 4800 }, { weight: '500g', price: 8600 }],
      img: 'img/prod-colombia.jpg',
    },
    {
      id: 'etiopia', category: 'single',
      name: 'Etiopía Yirgacheffe', badge: 'Single Origin',
      notes: 'Bergamota · Jazmín · Té negro',
      desc: 'Floral intenso, bergamota, té de jazmín. El más exótico de nuestra selección. Lavado, 2.000 m.',
      intensity: 2,
      variants: [{ weight: '250g', price: 5200 }, { weight: '500g', price: 9400 }],
      img: 'img/prod-etiopia.jpg',
    },
    {
      id: 'brasil', category: 'single',
      name: 'Brasil Cerrado', badge: 'Single Origin',
      notes: 'Chocolate · Nueces · Baja acidez',
      desc: 'Chocolate con leche, nueces, baja acidez. Clásico y reconfortante. Natural, 1.100 m.',
      intensity: 4,
      variants: [{ weight: '250g', price: 4000 }, { weight: '500g', price: 7200 }],
      img: 'img/prod-brasil.jpg',
    },
    {
      id: 'prensa', category: 'accesorio',
      name: 'Prensa Francesa ORIGEN', badge: 'Accesorio',
      notes: 'Borosilicato · Acero negro mate · 600 ml',
      desc: 'Vidrio borosilicato de alta resistencia, estructura de acero negro mate. 600 ml. Incluye filtro de repuesto.',
      intensity: null,
      variants: [{ weight: null, price: 12500 }],
      img: 'img/prod-prensa.jpg',
    },
    {
      id: 'dripper', category: 'accesorio',
      name: 'Dripper V60 ORIGEN', badge: 'Accesorio',
      notes: 'Cerámica artesanal · Negro mate',
      desc: 'Cerámica artesanal negra. Extracción limpia y controlada. Compatible con filtros Hario V60 02.',
      intensity: null,
      variants: [{ weight: null, price: 8900 }],
      img: 'img/prod-dripper.jpg',
    },
    {
      id: 'pack', category: 'accesorio',
      name: 'Pack Degustación', badge: 'Kit',
      notes: '3 blends × 100 g · Caja regalo',
      desc: '3 blends × 100 g en caja regalo de madera. Volcánico, Serranía y Nocturno. El punto de entrada perfecto.',
      intensity: null,
      variants: [{ weight: null, price: 5500 }],
      img: 'img/prod-pack.jpg',
    },
  ];

  function findProduct(id) { return PRODUCTS.find(p => p.id === id); }
  function fmtPrice(n) { return '$' + n.toLocaleString('es-AR'); }
  function intensityDots(n, size) {
    if (!n) return '';
    let html = `<div class="${size === 'lg' ? 'prod-modal__intensity' : 'prod-card__intensity'}">`;
    if (size === 'lg') html += '<span class="prod-modal__intensity-label">Intensidad</span>';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="i-dot${i <= n ? ' filled' : ''}"></span>`;
    }
    return html + '</div>';
  }

  /* ════════════════════════════════════════════
     2. CART STORE
  ════════════════════════════════════════════ */
  const CartStore = {
    KEY: 'origen_cart',
    items: [],

    load() {
      try {
        const raw = sessionStorage.getItem(this.KEY);
        this.items = raw ? JSON.parse(raw) : [];
      } catch { this.items = []; }
    },
    save() {
      sessionStorage.setItem(this.KEY, JSON.stringify(this.items));
    },
    _key(id, weight) { return id + '__' + (weight || 'u'); },

    add(product, weight, price) {
      const k = this._key(product.id, weight);
      const existing = this.items.find(i => i.k === k);
      if (existing) {
        existing.qty += 1;
      } else {
        this.items.push({
          k, id: product.id, name: product.name,
          weight: weight, price: price, img: product.img, qty: 1,
        });
      }
      this.save();
    },
    remove(k) {
      this.items = this.items.filter(i => i.k !== k);
      this.save();
    },
    updateQty(k, delta) {
      const item = this.items.find(i => i.k === k);
      if (!item) return;
      item.qty = Math.max(1, item.qty + delta);
      this.save();
    },
    getCount() { return this.items.reduce((s, i) => s + i.qty, 0); },
    getTotal() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
    buildWhatsAppMsg() {
      if (!this.items.length) return '';
      let msg = 'Hola ORIGEN! Quiero hacer el siguiente pedido:\n\n';
      this.items.forEach(i => {
        const label = i.weight ? `${i.name} (${i.weight})` : i.name;
        msg += `• ${label} x${i.qty} — ${fmtPrice(i.price * i.qty)}\n`;
      });
      msg += `\nTotal: ${fmtPrice(this.getTotal())}`;
      return encodeURIComponent(msg);
    },
  };

  /* ════════════════════════════════════════════
     3. CART UI
  ════════════════════════════════════════════ */
  const CartUI = {
    drawer: null, backdrop: null, body: null,
    empty: null, footer: null, totalEl: null,
    countEl: null,

    init() {
      this.drawer   = document.getElementById('cart-drawer');
      this.backdrop = this.drawer.querySelector('.cart-drawer__backdrop');
      this.body     = document.getElementById('cart-body');
      this.empty    = document.getElementById('cart-empty');
      this.totalEl  = document.getElementById('cart-total-amount');
      this.countEl  = document.getElementById('cart-count');

      document.getElementById('nav-cart').addEventListener('click', () => this.open());
      document.getElementById('cart-close').addEventListener('click', () => this.close());
      this.backdrop.addEventListener('click', () => this.close());
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });

      document.getElementById('cart-checkout').addEventListener('click', () => {
        const msg = CartStore.buildWhatsAppMsg();
        if (!msg) return;
        window.open('https://wa.me/5491155551234?text=' + msg, '_blank');
      });

      this.render();
    },

    open() {
      this.render();
      this.drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    },
    close() {
      this.drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    },

    render() {
      const count = CartStore.getCount();
      // Update nav badge
      this.countEl.textContent = count;
      this.countEl.classList.toggle('visible', count > 0);

      // Body
      if (!CartStore.items.length) {
        this.body.innerHTML = '';
        this.empty.style.display = 'flex';
        document.getElementById('cart-footer').style.display = 'none';
        return;
      }
      this.empty.style.display = 'none';
      document.getElementById('cart-footer').style.display = 'flex';
      this.totalEl.textContent = fmtPrice(CartStore.getTotal());

      this.body.innerHTML = CartStore.items.map(item => `
        <div class="cart-item" data-k="${item.k}">
          <img class="cart-item__img" src="${item.img}" alt="${item.name}" loading="lazy" />
          <div class="cart-item__info">
            <p class="cart-item__name">${item.name}</p>
            ${item.weight ? `<p class="cart-item__variant">${item.weight}</p>` : ''}
            <p class="cart-item__price">${fmtPrice(item.price)}</p>
          </div>
          <div class="cart-item__controls">
            <div class="cart-item__qty">
              <button class="qty-btn" data-k="${item.k}" data-action="dec" aria-label="Reducir cantidad">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-k="${item.k}" data-action="inc" aria-label="Aumentar cantidad">+</button>
            </div>
            <button class="cart-item__remove" data-k="${item.k}" aria-label="Eliminar">Quitar</button>
          </div>
        </div>
      `).join('');

      // Delegated events
      this.body.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const delta = btn.dataset.action === 'inc' ? 1 : -1;
          CartStore.updateQty(btn.dataset.k, delta);
          this.render();
        });
      });
      this.body.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', () => {
          CartStore.remove(btn.dataset.k);
          this.render();
        });
      });
    },

    bumpCount() {
      this.countEl.classList.remove('bump');
      void this.countEl.offsetWidth; // reflow
      this.countEl.classList.add('bump');
    },
  };

  /* ════════════════════════════════════════════
     4. PRODUCT MODAL UI
  ════════════════════════════════════════════ */
  const ModalUI = {
    modal: null, img: null, nameEl: null, catEl: null,
    notesEl: null, descEl: null, intensityEl: null,
    variantsEl: null, priceEl: null, addBtn: null,
    currentProduct: null, currentVariant: null,

    init() {
      this.modal      = document.getElementById('prod-modal');
      this.img        = document.getElementById('modal-img');
      this.nameEl     = document.getElementById('modal-name');
      this.catEl      = document.getElementById('modal-category');
      this.notesEl    = document.getElementById('modal-notes');
      this.descEl     = document.getElementById('modal-desc');
      this.intensityEl= document.getElementById('modal-intensity');
      this.variantsEl = document.getElementById('modal-variants');
      this.priceEl    = document.getElementById('modal-price');
      this.addBtn     = document.getElementById('modal-add-btn');

      document.getElementById('modal-backdrop').addEventListener('click', () => this.close());
      document.getElementById('modal-close').addEventListener('click',    () => this.close());
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });

      this.addBtn.addEventListener('click', () => {
        if (!this.currentProduct || !this.currentVariant) return;
        CartStore.add(this.currentProduct, this.currentVariant.weight, this.currentVariant.price);
        CartUI.render();
        CartUI.bumpCount();
        // Feedback
        const txt = this.addBtn.querySelector('.btn__text');
        const orig = txt.textContent;
        txt.textContent = '✓ Agregado';
        this.addBtn.disabled = true;
        setTimeout(() => { txt.textContent = orig; this.addBtn.disabled = false; }, 1800);
      });
    },

    open(productId) {
      const p = findProduct(productId);
      if (!p) return;
      this.currentProduct = p;

      // Populate
      this.img.src = p.img;
      this.img.alt = p.name;
      this.nameEl.textContent  = p.name;
      this.catEl.textContent   = p.category === 'blend' ? 'Blend de Especialidad'
                                : p.category === 'single' ? 'Single Origin' : 'Accesorio';
      this.notesEl.textContent = p.notes;
      this.descEl.textContent  = p.desc;

      // Intensity
      this.intensityEl.innerHTML = p.intensity ? intensityDots(p.intensity, 'lg') : '';

      // Variants
      this.variantsEl.innerHTML = '';
      p.variants.forEach((v, i) => {
        const btn = document.createElement('button');
        btn.className = 'variant-btn' + (i === 0 ? ' active' : '');
        btn.textContent = v.weight ? `${v.weight} — ${fmtPrice(v.price)}` : fmtPrice(v.price);
        btn.addEventListener('click', () => {
          this.variantsEl.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentVariant = v;
          this.priceEl.textContent = fmtPrice(v.price);
        });
        this.variantsEl.appendChild(btn);
      });

      // Set first variant as default
      this.currentVariant = p.variants[0];
      this.priceEl.textContent = fmtPrice(p.variants[0].price);

      // Show
      this.modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.modal.classList.remove('is-open');
      // Restore overflow only if cart is also closed
      if (!document.getElementById('cart-drawer').classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    },
  };

  /* ════════════════════════════════════════════
     5. SHOP UI — Grid + Filters
  ════════════════════════════════════════════ */
  const ShopUI = {
    init() {
      const grid = document.getElementById('prod-grid');
      if (!grid) return;

      // Render cards
      grid.innerHTML = PRODUCTS.map(p => {
        const fromPrice = fmtPrice(p.variants[0].price);
        const hasMulti  = p.variants.length > 1;
        return `
          <article class="prod-card" data-category="${p.category}" data-id="${p.id}"
                   role="button" tabindex="0" aria-label="Ver producto: ${p.name}">
            <div class="prod-card__img-wrap">
              <img class="prod-card__img" src="${p.img}" alt="${p.name}" loading="lazy" />
              <span class="prod-card__badge">${p.badge}</span>
            </div>
            <div class="prod-card__body">
              ${p.intensity ? intensityDots(p.intensity, 'sm') : ''}
              <h3 class="prod-card__name">${p.name}</h3>
              <p class="prod-card__notes">${p.notes}</p>
              <p class="prod-card__price">${hasMulti ? 'desde ' : ''}${fromPrice}</p>
              <button class="prod-card__cta" tabindex="-1" aria-hidden="true">
                Ver producto <span class="prod-card__cta-arrow">→</span>
              </button>
            </div>
          </article>
        `;
      }).join('');

      // Card click → modal
      grid.addEventListener('click', e => {
        const card = e.target.closest('.prod-card');
        if (card) ModalUI.open(card.dataset.id);
      });
      grid.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.prod-card');
          if (card) { e.preventDefault(); ModalUI.open(card.dataset.id); }
        }
      });

      // Filter buttons
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.filter;
          grid.querySelectorAll('.prod-card').forEach(card => {
            const show = cat === 'all' || card.dataset.category === cat;
            card.classList.toggle('is-hidden', !show);
          });
        });
      });

      // Footer filter links — activate a filter tab then scroll to #tienda
      document.querySelectorAll('[data-filter-link]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const cat = link.dataset.filterLink;
          const btn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
          if (btn) btn.click();
          document.querySelector('#tienda').scrollIntoView({ behavior: 'smooth' });
        });
      });
    },
  };

  /* ════════════════════════════════════════════
     6. NEWSLETTER UI
  ════════════════════════════════════════════ */
  const NewsletterUI = {
    init() {
      const form = document.getElementById('newsletter-form');
      if (!form) return;
      form.addEventListener('submit', e => {
        e.preventDefault();
        const confirm = document.getElementById('newsletter-confirm');
        const input   = document.getElementById('newsletter-input');
        if (!input.value.trim()) return;
        input.value = '';
        confirm.classList.add('visible');
        setTimeout(() => confirm.classList.remove('visible'), 5000);
      });
    },
  };

  /* ════════════════════════════════════════════
     7. INIT
  ════════════════════════════════════════════ */
  function init() {
    CartStore.load();
    ShopUI.init();
    ModalUI.init();
    CartUI.init();
    NewsletterUI.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
