/* ============================================================
   Master Door and Crown — Main JavaScript
   ============================================================ */

// Mark JS as loaded — CSS uses this to un-hide .reveal elements on old browsers
document.documentElement.classList.add('js-loaded');

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


/* === LIGHTBOX === */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  // gallery.html manages its own full lightbox with prev/next — don't double-bind
  if (document.getElementById('gallery-grid')) return;

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
    '.service-tile', '.gallery-preview-item',
    '.philosophy-card', '.process-step', '.city-card',
    '.psych-card', '.service-detail-img', '.city-service-item',
    '.section-header'
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

/* === CONTACT FORM === */
(function initContactForm() {
  const form = document.getElementById('estimate-form');
  if (!form) return;

  function validate() {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const empty = !field.value.trim();
      field.style.borderColor = empty ? '#c0392b' : '';
      if (empty) valid = false;
    });
    if (!valid) {
      const first = form.querySelector('[style*="c0392b"]');
      if (first) first.focus();
    }
    return valid;
  }

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) field.style.borderColor = '';
    });
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });
      const json = await res.json();

      if (json.success) {
        form.innerHTML = [
          '<div style="text-align:center;padding:48px 24px;">',
          '<p style="font-size:2rem;margin-bottom:12px;">✓</p>',
          '<h3 style="margin-bottom:8px;">Request Received</h3>',
          '<p style="color:var(--color-text-light);">We\'ll be in touch within one business day.</p>',
          '</div>'
        ].join('');
      } else {
        btn.disabled = false;
        btn.textContent = originalText;
        alert('Something went wrong. Please call us at (805) 404-0751 or email info@masterdoorandcrown.com.');
      }
    } catch (_) {
      btn.disabled = false;
      btn.textContent = originalText;
      alert('Network error. Please call us at (805) 404-0751 or email info@masterdoorandcrown.com.');
    }
  });
})();

/* === FAQ ACCORDION === */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  function syncAria() {
    items.forEach(i => {
      const open = i.classList.contains('open');
      const trigger = i.querySelector('.faq-question');
      const answer = i.querySelector('.faq-answer');
      if (trigger) trigger.setAttribute('aria-expanded', String(open));
      if (answer) answer.setAttribute('aria-hidden', String(!open));
    });
  }

  items.forEach(item => {
    const trigger = item.querySelector('.faq-question');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', 'false');
    const answer = item.querySelector('.faq-answer');
    if (answer) answer.setAttribute('aria-hidden', 'true');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
      syncAria();
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
