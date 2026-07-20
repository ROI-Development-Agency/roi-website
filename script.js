// ============= INTRO (homepage only) =============
const introEl = document.getElementById('intro');
if (introEl) {
  setTimeout(() => {
    introEl.style.display = 'none';
  }, 4600);
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
