/* ==========================================
   PETNIP — main.js
   Módulos: Navbar | Scroll Spy | Fade-In
            Reviews Slider | Cookie Banner
            Newsletter Validation
   ========================================== */

(function () {
  'use strict';

  /* ---- Navbar hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /* Fechar menu ao clicar em link */
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Fechar menu ao clicar fora */
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Scroll Spy (active nav link) ---- */
  const sections  = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function updateActiveLink () {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 100) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ---- Fade-in on scroll (IntersectionObserver) ---- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    /* Fallback: mostrar tudo imediatamente */
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- Reviews Slider ---- */
  const track  = document.getElementById('reviews-track');
  const dots   = document.querySelectorAll('.dot');
  let current  = 0;
  let autoplay;

  function goToSlide (index) {
    if (!track) return;
    const total = dots.length;
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('dot--active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(autoplay);
      goToSlide(Number(dot.dataset.index));
      startAutoplay();
    });
    dot.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') goToSlide(current + 1);
      if (e.key === 'ArrowLeft')  goToSlide(current - 1);
    });
  });

  function startAutoplay () {
    autoplay = setInterval(() => goToSlide(current + 1), 5000);
  }

  /* Pausar ao hover */
  if (track) {
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.parentElement.addEventListener('mouseleave', startAutoplay);
    /* Touch swipe */
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) goToSlide(diff > 0 ? current + 1 : current - 1);
    });
    startAutoplay();
  }

  /* ---- Cookie Banner ---- */
  const banner  = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  function hideBanner () {
    if (banner) {
      banner.classList.add('hidden');
      setTimeout(() => banner.remove(), 450);
    }
  }

  if (banner) {
    /* Verificar consentimento salvo */
    if (localStorage.getItem('petnip_cookies')) {
      hideBanner();
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('petnip_cookies', 'accepted');
        hideBanner();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('petnip_cookies', 'declined');
        hideBanner();
      });
    }

    /* Foco inicial no banner para acessibilidade */
    setTimeout(() => { if (acceptBtn) acceptBtn.focus(); }, 600);
  }

  /* ---- Newsletter Validation ---- */
  function setupNewsletter (formId, inputId, errorId) {
    const form  = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input) return;

      const val = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

      if (!valid) {
        if (error) {
          error.textContent = 'Por favor, insira um e-mail válido.';
          error.classList.add('visible');
        }
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }

      if (error) { error.classList.remove('visible'); error.textContent = ''; }
      input.setAttribute('aria-invalid', 'false');

      /* Feedback de sucesso */
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Inscrito!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; input.value = ''; }, 3000);
      }
    });

    /* Limpar erro ao digitar */
    if (input && error) {
      input.addEventListener('input', () => {
        error.classList.remove('visible');
        input.removeAttribute('aria-invalid');
      });
    }
  }

  setupNewsletter('newsletter-form', 'email-input', 'email-error');

  /* Footer newsletter (sem mensagem de erro dedicada) */
  const footerForm  = document.getElementById('footer-newsletter-form');
  if (footerForm) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = footerForm.querySelector('input[type="email"]');
      if (!input) return;
      const val = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!valid) { input.focus(); return; }
      const btn = footerForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = '✓ Inscrito!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Enviar'; btn.disabled = false; input.value = ''; }, 3000);
      }
    });
  }

  /* ---- Smooth nav scroll with offset (sticky header) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
