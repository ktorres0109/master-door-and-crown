/* ============================================================
   Master Door and Crown — Main JavaScript
   ============================================================ */

/* === MOBILE NAVIGATION === */
(function initNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const nav = document.getElementById('site-nav');
  if (!hamburger || !nav) return;

  function toggle(force) {
    const isOpen = typeof force === 'boolean' ? force : !nav.classList.contains('open');
    nav.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      toggle(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
})();

/* === ACTIVE NAV STATE === */
(function setActiveNav() {
  const path = window.location.pathname;
  const page = (path.split('/').pop() || 'index').replace(/\.html$/, '');

  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    const match = link.dataset.page === page ||
      (page === '' && link.dataset.page === 'index') ||
      (page === '/' && link.dataset.page === 'index');
    link.classList.toggle('active', match);
  });
})();

/* === GALLERY FILTER (legacy filter-btn support) === */
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* === LIGHTBOX === */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  function open(src, caption) {
    lightboxImg.src = '';
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const captionEl = item.querySelector('.gallery-caption, .gallery-cat-badge');
      const captionText = captionEl ? captionEl.textContent.trim().replace(/\s+/g, ' ') : (img.alt || '');
      open(img.src, captionText);
    });

    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) close();
  });
})();

/* === SCROLL REVEAL === */
(function initScrollReveal() {
  if (!window.IntersectionObserver) return;

  // Dynamically add .reveal to elements that don't have it yet
  const autoRevealSelectors = [
    '.service-tile', '.gallery-preview-item', '.gallery-item',
    '.philosophy-card', '.process-step', '.city-card',
    '.psych-card', '.service-detail-img', '.city-service-item',
    '.section-header', '.cta-strip'
  ];

  autoRevealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains('reveal') &&
          !el.classList.contains('reveal-left') &&
          !el.classList.contains('reveal-right')) {
        el.classList.add('reveal');
      }
    });
  });

  // Observe all reveal elements (both pre-existing in HTML and dynamically added)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
})();

/* === ANIMATED COUNTERS === */
(function initCounters() {
  if (!window.IntersectionObserver) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
})();

/* === NAV DROPDOWN (mobile touch) === */
(function initNavDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      // On desktop hover handles it — only intercept on touch/mobile
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const isOpen = dd.classList.contains('open');
      // Close all others
      dropdowns.forEach(d => d.classList.remove('open'));
      if (!isOpen) dd.classList.add('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });
})();

/* === FLOATING ACTION BUTTON === */
(function initFAB() {
  const fab = document.querySelector('.fab-main');
  const menu = document.querySelector('.fab-menu');
  if (!fab || !menu) return;

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menu.hasAttribute('hidden');
    if (isHidden) menu.removeAttribute('hidden');
    else menu.setAttribute('hidden', '');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.fab-container')) {
      menu.setAttribute('hidden', '');
    }
  });
})();

/* === IMAGE LOADED SHIMMER === */
(function initImageLoaded() {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });
})();

/* === CONTACT FORM VALIDATION === */
(function initContactForm() {
  const form = document.getElementById('estimate-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) {
      e.preventDefault();
      const firstInvalid = form.querySelector('[required]:invalid, [style*="c0392b"]');
      if (firstInvalid) firstInvalid.focus();
    }
  });

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) field.style.borderColor = '';
    });
  });
})();

/* === FAQ ACCORDION === */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-question');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });

    trigger.setAttribute('aria-expanded', 'false');
    const answer = item.querySelector('.faq-answer');
    if (answer) answer.setAttribute('aria-hidden', 'true');
  });

  document.addEventListener('click', () => {
    items.forEach(i => {
      const open = i.classList.contains('open');
      const trigger = i.querySelector('.faq-question');
      const answer = i.querySelector('.faq-answer');
      if (trigger) trigger.setAttribute('aria-expanded', String(open));
      if (answer) answer.setAttribute('aria-hidden', String(!open));
    });
  });
})();

/* === STICKY MOBILE CALL BUTTON === */
(function initStickyCall() {
  const btn = document.createElement('a');
  btn.href = 'tel:+18054040751';
  btn.className = 'sticky-call-btn';
  btn.setAttribute('aria-label', 'Call Master Door and Crown at (805) 404-0751');
  btn.textContent = '📞 Call (805) 404-0751';
  document.body.appendChild(btn);
})();
