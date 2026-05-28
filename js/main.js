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
  const page = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    const match = link.dataset.page === page ||
      (page === '' && link.dataset.page === 'index.html') ||
      (page === '/' && link.dataset.page === 'index.html');
    link.classList.toggle('active', match);
  });
})();

/* === GALLERY FILTER === */
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
        if (show) {
          item.style.animation = 'none';
          item.offsetHeight; // reflow
          item.style.animation = '';
        }
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
      const captionEl = item.querySelector('.gallery-caption');
      const captionText = captionEl ? captionEl.textContent.trim().replace(/\s+/g, ' ') : (img.alt || '');
      open(img.src, captionText);
    });

    // Keyboard accessibility
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

  const targets = document.querySelectorAll(
    '.service-tile, .gallery-preview-item, .gallery-item, ' +
    '.philosophy-card, .process-step, .city-card, ' +
    '.psych-card, .about-teaser-img, .service-detail-img'
  );

  if (!targets.length) return;

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* === CONTACT FORM VALIDATION (progressive enhancement) === */
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
    item.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
  });

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.faq-item');
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
  btn.href = 'tel:+18183389918';
  btn.className = 'sticky-call-btn';
  btn.setAttribute('aria-label', 'Call Master Door and Crown at (818) 338-9918');
  btn.textContent = '📞 Call (818) 338-9918';
  document.body.appendChild(btn);
})();
