/* ============================================================
   QUICKLAUNCH CONSULTING — MAIN JAVASCRIPT
   2026 | Vanilla JS | No dependencies
   ============================================================ */

'use strict';

const DIAGNOSTIC_ACCESS_KEY = 'quicklaunchDiagnosticAccess';

function trackEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

(function initMeasurement() {
  const cfg = window.QUICKLAUNCH_CONFIG || {};

  if (cfg.ga4MeasurementId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cfg.ga4MeasurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.ga4MeasurementId, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  if (cfg.clarityProjectId) {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments);};
      t=l.createElement(r);t.async=1;t.src=`https://www.clarity.ms/tag/${i}`;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', cfg.clarityProjectId);
  }
})();

function grantDiagnosticAccess() {
  try {
    localStorage.setItem(DIAGNOSTIC_ACCESS_KEY, JSON.stringify({ grantedAt: Date.now() }));
  } catch {}
}

function hasDiagnosticAccess() {
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_ACCESS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.grantedAt);
  } catch {
    return false;
  }
}

// ── SCROLL PROGRESS BAR ──────────────────────────────────────
(function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
})();

// ── STICKY NAV ───────────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });
})();

// ── MOBILE MENU ──────────────────────────────────────────────
(function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    trackEvent('navigation_toggle', {
      state: menu.classList.contains('open') ? 'close' : 'open'
    });
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
})();

// ── SCROLL REVEAL ANIMATIONS ─────────────────────────────────
(function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3, .reveal-delay-4'
  );
  if (!elements.length || !('IntersectionObserver' in window)) {
    // Fallback: make all visible immediately
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ── FAQ ACCORDION ────────────────────────────────────────────
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        // Scroll into view if needed
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300);
      }
    });
  });
})();

// ── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ── ANIMATED STAT COUNTERS ───────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  function animateCounter(el) {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const decimal = el.dataset.decimal || 0;
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (target * eased).toFixed(decimal);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();

// ── FORMSPREE AJAX FORMS ─────────────────────────────────────
(function initForms() {
  const forms = document.querySelectorAll('form[action*="formspree"]');

  forms.forEach(form => {
    const successId = form.id ? form.id.replace('-form', '-success') : null;
    const successEl = successId ? document.getElementById(successId) : null;
    const btn       = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!btn) return;

      const originalText = btn.textContent;
      const successRedirect = form.dataset.successRedirect;
      btn.textContent = 'Sending...';
      btn.disabled    = true;

      try {
        const data = new FormData(form);
        const res  = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          trackEvent('generate_lead', {
            form_id: form.id || 'unknown_form',
            destination: successRedirect || 'inline_success'
          });
          if (successRedirect) {
            if (successRedirect.includes('diagnostic.html')) {
              grantDiagnosticAccess();
            }
            window.location.href = successRedirect;
            return;
          }
          form.style.display   = 'none';
          if (successEl) successEl.classList.add('show');
        } else {
          btn.textContent = 'Error - Try Again';
          btn.disabled    = false;
        }
      } catch {
        btn.textContent = 'Error - Try Again';
        btn.disabled    = false;
      }
    });
  });
})();

(function initPrimaryCtaTracking() {
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    const label = (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);

    if (href.includes('apply.html#fit-call')) {
      trackEvent('book_fit_call_click', { href, label });
      return;
    }

    if (href.includes('apply.html#apply-path')) {
      trackEvent('apply_path_click', { href, label });
      return;
    }

    if (href.includes('#diagnostic-access')) {
      trackEvent('diagnostic_access_click', { href, label });
      return;
    }

    if (href.includes('the-path.html')) {
      trackEvent('view_path_click', { href, label });
    }
  });
})();

(function initDiagnosticAccessGate() {
  const path = window.location.pathname || '';
  if (!/diagnostic\.html$/i.test(path)) return;
  if (hasDiagnosticAccess()) return;
  window.location.replace('index.html#diagnostic-access');
})();

// DIAGNOSTIC QUIZ SCORING
(function initDiagnosticQuiz() {
  const quiz = document.getElementById('diagnostic-quiz');
  if (!quiz) return;

  const result = document.getElementById('quiz-result');
  const resultScore = document.getElementById('quiz-result-score');
  const resultLevel = document.getElementById('quiz-result-level');
  const resultCopy = document.getElementById('quiz-result-copy');
  const resultPatterns = document.getElementById('quiz-result-patterns');
  const resultCta = document.getElementById('quiz-result-cta');
  const explainer = document.getElementById('diagnostic-explainer');

  if (!result || !resultScore || !resultLevel || !resultCopy || !resultPatterns || !resultCta) return;

  const patternLabels = {
    governance_shadow: 'Governance Shadow',
    vision_drift: 'Vision Drift',
    founder_bottleneck: 'Founder Bottleneck',
    financial_fragility: 'Financial Fragility',
    scale_trap: 'Scale Trap',
    wrong_fit_team: 'Wrong-Fit Team',
    conflict_avoidance: 'Conflict Avoidance'
  };

  quiz.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(quiz);
    const activePatterns = [];
    let score = 0;

    Object.entries(patternLabels).forEach(([key, label]) => {
      const answer = data.get(key);
      if (answer === 'yes') {
        score += 1;
        activePatterns.push(label);
      } else if (answer === 'somewhat') {
        score += 0.5;
      }
    });

    const roundedScore = Math.max(activePatterns.length, Math.round(score));
    let level = 'Early Warning';
    let copy = 'You likely have one visible structural pressure point. Catch it now and you can repair it before it becomes a momentum killer.';
    let ctaLabel = 'See the Full Path';
    let ctaHref = 'the-path.html';

    if (roundedScore >= 4) {
      level = 'Critical';
      copy = 'Multiple collapse patterns look active at once. This is less of a small leak and more of a systems-level strain that deserves immediate structural repair.';
      ctaLabel = 'Book a Fit Call';
      ctaHref = 'apply.html#fit-call';
    } else if (roundedScore >= 2) {
      level = 'High Risk';
      copy = 'You have compounding issues, not isolated friction. The good news is the pattern is now nameable, and that makes it fixable.';
      ctaLabel = 'Book a Fit Call';
      ctaHref = 'apply.html#fit-call';
    }

    resultScore.textContent = roundedScore.toString();
    resultLevel.textContent = level;
    resultCopy.textContent = copy;
    resultPatterns.innerHTML = activePatterns.length
      ? activePatterns.map((pattern) => `<li>${pattern}</li>`).join('')
      : '<li>No clear dominant pattern flagged yet. If the project still feels shaky, start with the Path to strengthen structure before strain compounds.</li>';
    resultCta.textContent = ctaLabel;
    resultCta.setAttribute('href', ctaHref);

    if (explainer) {
      explainer.hidden = false;
      explainer.classList.add('is-revealed');
    }

    result.classList.add('show');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();

// ── ACTIVE NAV LINK HIGHLIGHTING ─────────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle(
            'nav-active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();

// ── HERO IMAGE PLACEHOLDER FILL ──────────────────────────────
// If hero image fails to load, show a gradient placeholder
(function initImgFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent && !parent.querySelector('.img-fallback')) {
        const ph = document.createElement('div');
        ph.className   = 'img-fallback';
        ph.style.cssText = `
          width:100%;height:100%;min-height:320px;
          background:linear-gradient(135deg,#0A1628 0%,#0F2040 100%);
          display:flex;align-items:center;justify-content:center;
          color:#475569;font-size:0.875rem;text-align:center;padding:2rem;
          border-radius:inherit;
        `;
        ph.textContent = '[ Image placeholder - see image-prompts.txt ]';
        parent.appendChild(ph);
      }
    });
  });
})();

// ── COPY: External links open in new tab safely ──────────────
(function initExternalLinks() {
  document.querySelectorAll('a[href^="http"]').forEach(a => {
    if (!a.hostname || a.hostname !== window.location.hostname) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
})();

// ── PHASE CARD HOVER TILT (subtle 3D) ────────────────────────
(function initTilt() {
  if (window.matchMedia('(pointer:coarse)').matches) return; // skip on touch
  const cards = document.querySelectorAll('.phase-card, .archetype-card, .testimonial-card');
  const MAX_TILT = 4; // degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotateY = dx * MAX_TILT;
      const rotateX = -dy * MAX_TILT;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => { card.style.transition = ''; }, 400);
    });
  });
})();

// ── INIT LOG ─────────────────────────────────────────────────
console.log('%cQuickLaunch Consulting%c - Site loaded. Built for founders who are serious about building something real.', 'color:#0A6EFF;font-weight:bold;font-size:14px', 'color:#94A3B8;font-size:12px');
