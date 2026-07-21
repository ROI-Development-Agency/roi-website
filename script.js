// ============= INTRO (homepage only) =============
const introEl = document.getElementById('intro');
if (introEl) {
  setTimeout(() => {
    introEl.style.display = 'none';
  }, 3400);
  introEl.addEventListener('click', () => {
    introEl.style.display = 'none';
  });
}

// ============= NAV SCROLL =============
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
}

// ============= MOBILE MENU =============
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileToggle.textContent = mobileMenu.classList.contains('open') ? '×' : '≡';
  });
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileToggle.textContent = '≡';
    });
  });
}

// ============= SCROLL REVEAL =============
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

// ============= POINTER INTERACTIONS (desktop only) =============
(function () {
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) return;

  const EASE = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.3, 1)';

  // 1) Magnetic buttons — lean toward the cursor
  document.querySelectorAll('.btn-primary, .btn-light, .btn-outline, .nav-cta').forEach((btn) => {
    const pull = 0.28;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transition = 'transform 0.1s linear';
      btn.style.transform = `translate(${x * pull}px, ${y * pull}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = EASE;
      btn.style.transform = '';
    });
  });

  // 2) Subtle 3D tilt on cards
  document.querySelectorAll('.approach-card, .blog-card').forEach((card) => {
    const MAX = 5; // degrees
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'transform 0.1s linear';
      card.style.transform = `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = EASE;
      card.style.transform = '';
    });
  });

  // 3) Parallax drift on the decorative hero anchor
  const heroAnchor = document.querySelector('.hero-anchor-bg');
  if (heroAnchor) {
    heroAnchor.style.transition = 'transform 0.4s ease-out';
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      heroAnchor.style.transform = `translate(${x * 34}px, ${y * 34}px)`;
    }, { passive: true });
  }
})();

// ============= CAROUSEL ARROWS =============
(function() {
  const wrap = document.getElementById('carousel-wrap');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!wrap || !prevBtn || !nextBtn) return;

  const track = wrap.querySelector('.testimonial-carousel-track');
  if (!track) return;

  let manualOffset = 0;
  let paused = false;

  // When user clicks arrow, pause auto-animation and shift manually
  function shiftCarousel(direction) {
    paused = true;
    track.style.animation = 'none';

    // Get current computed transform
    const computedStyle = window.getComputedStyle(track);
    const matrix = new DOMMatrix(computedStyle.transform);
    const currentX = matrix.m41;

    // Calculate shift amount (one card width + gap)
    const card = track.querySelector('.carousel-card');
    const cardWidth = card ? card.offsetWidth + 28 : 448;
    const newX = currentX + (direction === 'prev' ? cardWidth : -cardWidth);

    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform = `translateX(${newX}px)`;

    // Resume auto-scroll after 4 seconds of inactivity
    clearTimeout(window.carouselResumeTimer);
    window.carouselResumeTimer = setTimeout(() => {
      // Get the current X position and continue scrolling from there
      const cs = window.getComputedStyle(track);
      const m = new DOMMatrix(cs.transform);
      const x = m.m41;
      track.style.transition = 'none';
      track.style.animation = 'none';
      // Restart the auto-scroll from current position
      requestAnimationFrame(() => {
        track.style.animation = 'scrollLeft 50s linear infinite';
        paused = false;
      });
    }, 4000);
  }

  prevBtn.addEventListener('click', () => shiftCarousel('prev'));
  nextBtn.addEventListener('click', () => shiftCarousel('next'));
})();
