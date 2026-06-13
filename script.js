/* ════════════════════════════════════════════════════════
   TRIOCORE — script.js  v2.0
   Premium · Cinematic · 60 FPS
   ════════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ─────────────────────────────────────────── */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const lerp  = (a, b, t) => a + (b - a) * t;
const qs    = (sel, ctx = document) => ctx.querySelector(sel);
const qsa   = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ════════════════════════════════════════════════════════
   1. LOADER
   ════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = qs('#loader');
  if (!loader) return;

  const onReady = () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      // Trigger hero entrance after loader fades
      setTimeout(() => {
        loader.style.display = 'none';
      }, 900);
    }, 2200);
  };

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    onReady();
  } else {
    window.addEventListener('load', onReady, { once: true });
  }
}

/* ════════════════════════════════════════════════════════
   2. LENIS SMOOTH SCROLL
   ════════════════════════════════════════════════════════ */
let lenis;

function initLenis() {
  // Dynamically load Lenis if not present
  const loadLenis = () => new Promise(resolve => {
    if (window.Lenis) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js';
    s.onload = resolve;
    s.onerror = resolve; // graceful fallback
    document.head.appendChild(s);
  });

  loadLenis().then(() => {
    if (!window.Lenis) return; // fallback: native scroll

    lenis = new Lenis({
      duration: 1.35,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // RAF loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync anchor links with Lenis
    qsa('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = qs(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.6 });
      });
    });
  });
}

/* ════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
   ════════════════════════════════════════════════════════ */
function initCursor() {
  const dot   = qs('#cursor');
  const trail = qs('#cursor-trail');
  if (!dot || !trail) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0;
  let tx = 0, ty = 0;
  let isVisible = false;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      trail.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    trail.style.opacity = '0';
    isVisible = false;
  });

  // Dot follows directly
  document.addEventListener('mousemove', e => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });

  // Trail lerps
  function animateTrail() {
    tx = lerp(tx, mx, 0.12);
    ty = lerp(ty, my, 0.12);
    trail.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover states
  const hoverTargets = 'a, button, .team-card, .service-card, .why-card, .innov-card, .showcase-card, .tech-pill, .tag, .tilt-card';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Click burst
  document.addEventListener('mousedown', () => {
    dot.style.transform += ' scale(0.75)';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = dot.style.transform.replace(' scale(0.75)', '');
  });
}

/* ════════════════════════════════════════════════════════
   4. NAVBAR
   ════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const mobileMenu = qs('#mobileMenu');
  const mobLinks  = qsa('.mob-link');
  const navLinks  = qsa('.nav-link');

  if (!navbar) return;

  // Scroll shrink
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    lastY = y;
  }, { passive: true });

  // Mobile toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    mobLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active link on scroll
  const sections = qsa('section[id]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════════════════
   5. THEME TOGGLE
   ════════════════════════════════════════════════════════ */
function initTheme() {
  const btn  = qs('#themeToggle');
  const icon = qs('#themeIcon');
  if (!btn) return;

  const stored = localStorage.getItem('triocore-theme');
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const current = stored || preferred;

  applyTheme(current);

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('triocore-theme', next);
  });

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (icon) {
      icon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

/* ════════════════════════════════════════════════════════
   6. PARTICLE SYSTEM (Hero)
   ════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = qs('#particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animFrame;

  const COUNT = window.innerWidth < 768 ? 55 : 110;
  const MOUSE = { x: -9999, y: -9999 };
  const CONNECT_DIST = 130;
  const MOUSE_REPEL  = 90;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.15,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Mouse repel
      const dx = p.x - MOUSE.x;
      const dy = p.y - MOUSE.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.8;
        p.vx += (dx / dist) * force * 0.6;
        p.vy += (dy / dist) * force * 0.6;
      }

      // Dampen
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -2) p.x = W + 2;
      else if (p.x > W + 2) p.x = -2;
      if (p.y < -2) p.y = H + 2;
      else if (p.y > H + 2) p.y = -2;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  init();
  draw();

  window.addEventListener('resize', () => { init(); }, { passive: true });

  // Sync with global mouse
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    MOUSE.x = e.clientX - rect.left;
    MOUSE.y = e.clientY - rect.top;
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════
   7. MOUSE GLOW SPOTLIGHT (Hero)
   ════════════════════════════════════════════════════════ */
function initMouseGlow() {
  const glow = qs('#mouseGlow');
  if (!glow) return;

  let gx = 0, gy = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    gx = e.clientX;
    gy = e.clientY;
  }, { passive: true });

  function animate() {
    tx = lerp(tx, gx, 0.07);
    ty = lerp(ty, gy, 0.07);
    glow.style.left = tx + 'px';
    glow.style.top  = ty + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}

/* ════════════════════════════════════════════════════════
   8. HERO COUNTER ANIMATION
   ════════════════════════════════════════════════════════ */
function initHeroCounters() {
  const counters = qsa('.stat-num[data-count]');
  let started = false;

  function runCounter(el) {
    const target = +el.getAttribute('data-count');
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const heroSection = qs('.hero');
  if (!heroSection) return;

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !started) {
      started = true;
      setTimeout(() => counters.forEach(runCounter), 1400);
    }
  }, { threshold: 0.3 });

  obs.observe(heroSection);
}

/* ════════════════════════════════════════════════════════
   9. SECTION REVEAL (Intersection Observer)
   ════════════════════════════════════════════════════════ */
function initReveal() {
  const targets = qsa('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.getAttribute('data-delay') || 0;
      setTimeout(() => {
        el.classList.add('revealed');
      }, +delay);
      observer.unobserve(el);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  targets.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════════════
   10. TILT CARDS (3D hover)
   ════════════════════════════════════════════════════════ */
function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = qsa('.tilt-card');

  cards.forEach(card => {
    let rafId;
    let currentRx = 0, currentRy = 0;
    let targetRx  = 0, targetRy  = 0;
    let isHovered = false;

    card.addEventListener('mouseenter', () => { isHovered = true; });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      targetRy = dx * 8;   // max 8deg rotation
      targetRx = -dy * 6;
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRx = 0;
      targetRy = 0;
    });

    function animateTilt() {
      currentRx = lerp(currentRx, targetRx, isHovered ? 0.1 : 0.06);
      currentRy = lerp(currentRy, targetRy, isHovered ? 0.1 : 0.06);

      const mag = Math.sqrt(currentRx * currentRx + currentRy * currentRy);
      if (mag > 0.01) {
        card.style.transform = `perspective(800px) rotateX(${currentRx}deg) rotateY(${currentRy}deg)`;
      } else {
        card.style.transform = '';
      }

      rafId = requestAnimationFrame(animateTilt);
    }
    animateTilt();
  });
}

/* ════════════════════════════════════════════════════════
   11. MAGNETIC BUTTONS
   ════════════════════════════════════════════════════════ */
function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magnets = qsa('.magnetic');

  magnets.forEach(el => {
    let cx = 0, cy = 0;
    let tcx = 0, tcy = 0;
    let hovering = false;
    let rafId;

    el.addEventListener('mouseenter', e => {
      hovering = true;
    });

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      tcx = dx * 0.32;
      tcy = dy * 0.32;
    });

    el.addEventListener('mouseleave', () => {
      hovering = false;
      tcx = 0;
      tcy = 0;
    });

    function animate() {
      cx = lerp(cx, tcx, hovering ? 0.14 : 0.08);
      cy = lerp(cy, tcy, hovering ? 0.14 : 0.08);

      if (Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
        el.style.transform = `translate(${cx}px, ${cy}px)`;
      } else {
        el.style.transform = '';
      }

      rafId = requestAnimationFrame(animate);
    }
    animate();
  });
}

/* ════════════════════════════════════════════════════════
   12. GENERAL COUNTERS (Why Section)
   ════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = qsa('.counter-num[data-count]');
  const triggered = new WeakSet();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (triggered.has(el)) return;
      triggered.add(el);

      const target   = +el.getAttribute('data-count');
      const duration = 1600;
      const start    = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.floor(eased * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════════════
   13. ROADMAP DOT ACTIVE STATES
   ════════════════════════════════════════════════════════ */
function initRoadmap() {
  const items = qsa('.rm-item');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        const dot = qs('.rm-dot', entry.target);
        if (dot && !dot.classList.contains('future')) {
          // Already has active class in HTML for current year
        }
      }
    });
  }, { threshold: 0.35 });

  items.forEach(item => observer.observe(item));
}

/* ════════════════════════════════════════════════════════
   14. BACK TO TOP
   ════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.8 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ════════════════════════════════════════════════════════
   15. CONTACT FORM
   ════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = qs('#contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn  = form.querySelector('button[type="submit"]');
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');

    // Loading state
    btn.disabled = true;
    span.textContent = 'Sending…';
    icon.className = 'fas fa-spinner fa-spin';

    // Simulate async (replace with real fetch when backend ready)
    await new Promise(r => setTimeout(r, 1600));

    // Success state
    span.textContent = 'Message Sent!';
    icon.className = 'fas fa-check';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    btn.style.boxShadow = '0 8px 24px rgba(34,197,94,0.35)';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      span.textContent = 'Send Message';
      icon.className = 'fas fa-paper-plane';
      btn.style.background = '';
      btn.style.boxShadow = '';
    }, 3500);
  });

  // Floating label micro-interaction
  qsa('.form-group input, .form-group textarea', form).forEach(input => {
    const label = input.previousElementSibling;
    if (!label) return;

    input.addEventListener('focus', () => {
      if (label) label.style.color = 'var(--accent-3)';
    });
    input.addEventListener('blur', () => {
      if (label) label.style.color = '';
    });
  });
}

/* ════════════════════════════════════════════════════════
   16. MARQUEE PAUSE ON HOVER (already in CSS, backup)
   ════════════════════════════════════════════════════════ */
function initMarquee() {
  const track = qs('.marquee-track');
  if (!track) return;
  // CSS handles pause-on-hover; this adds smoother pause
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
}

/* ════════════════════════════════════════════════════════
   17. TIMELINE DOTS — stagger on scroll
   ════════════════════════════════════════════════════════ */
function initTimeline() {
  const items = qsa('.timeline-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }, i * 90);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    item.style.transition = `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`;
    observer.observe(item);
  });
}

/* ════════════════════════════════════════════════════════
   18. CARD GLOW — follows mouse inside card
   ════════════════════════════════════════════════════════ */
function initCardGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = qsa('.team-card, .service-card, .innov-card, .why-card');

  cards.forEach(card => {
    const glow = card.querySelector('.card-glow') || null;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;

      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);

      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(124,58,237,0.1), transparent 55%)`;
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   19. HERO ORB PARALLAX (subtle, mouse-driven)
   ════════════════════════════════════════════════════════ */
function initOrbParallax() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const orb1 = qs('.orb-1');
  const orb2 = qs('.orb-2');
  const orb3 = qs('.orb-3');
  if (!orb1) return;

  let mx = 0, my = 0;
  let r1x = 0, r1y = 0;
  let r2x = 0, r2y = 0;
  let r3x = 0, r3y = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    mx = nx;
    my = ny;
  }, { passive: true });

  function animate() {
    r1x = lerp(r1x, mx * 18, 0.04);
    r1y = lerp(r1y, my * 18, 0.04);
    r2x = lerp(r2x, mx * -12, 0.05);
    r2y = lerp(r2y, my * -12, 0.05);
    r3x = lerp(r3x, mx * 24, 0.03);
    r3y = lerp(r3y, my * 24, 0.03);

    orb1.style.transform = `translate(${r1x}px, ${r1y}px)`;
    orb2.style.transform = `translate(${r2x}px, ${r2y}px)`;
    orb3.style.transform = `translate(${r3x}px, ${r3y}px)`;

    requestAnimationFrame(animate);
  }
  animate();
}

/* ════════════════════════════════════════════════════════
   20. SKILL CHIP STAGGER on card hover
   ════════════════════════════════════════════════════════ */
function initSkillChips() {
  qsa('.team-card').forEach(card => {
    const chips = qsa('.skill-chip', card);

    card.addEventListener('mouseenter', () => {
      chips.forEach((chip, i) => {
        chip.style.transitionDelay = `${i * 35}ms`;
      });
    });

    card.addEventListener('mouseleave', () => {
      chips.forEach(chip => {
        chip.style.transitionDelay = '0ms';
      });
    });
  });
}

/* ════════════════════════════════════════════════════════
   21. SECTION TITLE GRADIENT SHIMMER on reveal
   ════════════════════════════════════════════════════════ */
function initTitleShimmer() {
  const titles = qsa('.section-title');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('shimmer-active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  titles.forEach(t => observer.observe(t));
}

/* ════════════════════════════════════════════════════════
   22. FOOTER LINK HOVER STAGGER
   ════════════════════════════════════════════════════════ */
function initFooter() {
  qsa('.footer-links ul').forEach(ul => {
    const links = qsa('a', ul);
    links.forEach((a, i) => {
      a.style.transitionDelay = `${i * 20}ms`;
    });
  });
}

/* ════════════════════════════════════════════════════════
   23. SHOWCASE CARD HOVER — image scale
   ════════════════════════════════════════════════════════ */
function initShowcase() {
  qsa('.showcase-card').forEach(card => {
    const img = qs('.showcase-img', card);
    if (!img) return;

    card.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.03)';
      img.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
    });
    card.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });
}

/* ════════════════════════════════════════════════════════
   24. INNOVATION CARD — progress accent
   ════════════════════════════════════════════════════════ */
function initInnovCards() {
  qsa('.innov-card').forEach(card => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    observer.observe(card);
  });
}

/* ════════════════════════════════════════════════════════
   25. REDUCE MOTION GUARD
   ════════════════════════════════════════════════════════ */
function respectReducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Immediately reveal everything, cancel RAF-heavy stuff
  qsa('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    el.classList.add('revealed');
  });

  qsa('.word').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  const badge = qs('.hero-badge');
  if (badge) badge.style.opacity = '1';

  qsa('.hero-sub, .hero-ctas, .hero-stats, .scroll-indicator').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ════════════════════════════════════════════════════════
   26. SCROLL PROGRESS INDICATOR
   ════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '2px',
    width: '0%',
    background: 'linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))',
    zIndex: '10001',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════
   INIT — DOMContentLoaded
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Guard: respect reduced motion first
  respectReducedMotion();

  // Core
  initLoader();
  initLenis();
  initTheme();
  initNavbar();

  // Hero
  initParticles();
  initMouseGlow();
  initHeroCounters();
  initOrbParallax();

  // Interactions
  initCursor();
  initMagnetic();
  initTilt();
  initCardGlow();
  initSkillChips();

  // Scroll-driven
  initReveal();
  initCounters();
  initTimeline();
  initRoadmap();
  initScrollProgress();

  // Section specifics
  initShowcase();
  initInnovCards();
  initTitleShimmer();
  initMarquee();
  initFooter();

  // UI
  initContactForm();
  initBackToTop();
});

/* ════════════════════════════════════════════════════════
   PERFORMANCE HINT — preload fonts & assets
   ════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  // Force GPU layers on key elements
  qsa('.team-card, .service-card, .innov-card, .why-card, .showcase-card').forEach(el => {
    el.style.willChange = 'transform';
  });

  // Clean up will-change after animations settle (prevent excessive memory)
  setTimeout(() => {
    qsa('[style*="will-change"]').forEach(el => {
      if (!el.matches(':hover')) {
        // Keep will-change only on animated elements
        if (!el.closest('.hero')) {
          el.style.willChange = 'auto';
        }
      }
    });
  }, 4000);
}, { once: true });