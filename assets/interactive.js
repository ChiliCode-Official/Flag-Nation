/**
 * Flag Nation Interactive Engine
 * Restores full native interactivity (Carousel, Rotators, Tickers, Mobile Menu, Cart)
 * 100% offline, standalone and optimized for GitHub Pages.
 */

(function () {
  'use strict';

  // --- 1. EDITORIAL CAROUSEL RESTORATION ---
  function initCarousels() {
    const carousels = document.querySelectorAll('section[aria-label*="editorial carousel"]');
    carousels.forEach(carousel => {
      const imgContainer = carousel.querySelector('div[style*="position:absolute;inset:0;z-index:0"]');
      if (!imgContainer) return;
      const images = Array.from(imgContainer.querySelectorAll('img'));
      if (images.length === 0) return;

      const prevBtn = carousel.querySelector('button[aria-label="Previous story"]');
      const nextBtn = carousel.querySelector('button[aria-label="Next story"]');
      const navButtons = Array.from(carousel.querySelectorAll('nav[aria-label="Select story"] button'));
      const articleTitle = carousel.querySelector('article h2');
      const articleBadge = carousel.querySelector('article span');
      const articleSubtitle = carousel.querySelector('article p');

      let currentIndex = 0;
      let autoplayTimer = null;

      // Extract story data from nav buttons
      const stories = navButtons.map(btn => {
        const divs = btn.querySelectorAll('div:last-child div');
        const badgeEl = divs[1];
        const titleEl = divs[2];
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          badge: badgeEl ? badgeEl.textContent.trim() : ''
        };
      });

      function showSlide(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;

        // Transition background images
        images.forEach((img, i) => {
          img.style.transition = 'opacity 0.45s ease-in-out';
          img.style.opacity = i === currentIndex ? '1' : '0';
        });

        // Update Nav button active states
        navButtons.forEach((btn, i) => {
          const isActive = i === currentIndex;
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          btn.style.backgroundColor = isActive ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.42)';
          btn.style.color = isActive ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.84)';
          btn.style.borderColor = isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.14)';

          const indicator = btn.querySelector('div[style*="position:absolute;left:0"]');
          if (indicator) {
            indicator.style.backgroundColor = isActive ? 'rgb(255, 107, 0)' : 'transparent';
          }
        });

        // Update Article Text
        if (stories[currentIndex]) {
          if (articleTitle && stories[currentIndex].title) {
            articleTitle.textContent = stories[currentIndex].title;
          }
          if (articleBadge && stories[currentIndex].badge) {
            articleBadge.textContent = stories[currentIndex].badge;
          }
        }
      }

      function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
          showSlide(currentIndex + 1);
        }, 5000);
      }

      function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          showSlide(currentIndex - 1);
          startAutoplay();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          showSlide(currentIndex + 1);
          startAutoplay();
        });
      }

      navButtons.forEach((btn, idx) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          showSlide(idx);
          startAutoplay();
        });
      });

      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);

      // Initialize
      showSlide(0);
      startAutoplay();
    });
  }

  // --- 2. INFINITE ROTATOR / TICKER RESTORATION ---
  function initTickers() {
    const tickerUls = document.querySelectorAll('ul:has(li.ticker-item)');
    tickerUls.forEach(ul => {
      ul.style.opacity = '1';
      ul.style.display = 'flex';
      ul.style.willChange = 'transform';

      const parent = ul.parentElement;
      if (parent) {
        parent.style.overflow = 'hidden';
      }

      // Clone items to ensure continuous infinite loop
      const items = Array.from(ul.children);
      items.forEach(item => {
        const clone = item.cloneNode(true);
        ul.appendChild(clone);
      });

      let pos = 0;
      const speed = 0.65; // pixels per frame

      function animate() {
        pos -= speed;
        const halfWidth = ul.scrollWidth / 2;
        if (halfWidth > 0 && Math.abs(pos) >= halfWidth) {
          pos = 0;
        }
        ul.style.transform = 'translateX(' + pos + 'px)';
        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    });
  }

  // --- 3. MOBILE MENU TOGGLE RESTORATION ---
  function initMobileMenu() {
    const menuIcons = document.querySelectorAll('[data-framer-name="Menu Icon"]');
    menuIcons.forEach(icon => {
      const navContainer = icon.closest('.framer-BIi1o') || icon.closest('nav') || document.body;
      const mobileMenu = navContainer.querySelector('[data-framer-name="Mobile Menu"]');

      if (mobileMenu) {
        let isOpen = false;
        mobileMenu.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
        mobileMenu.style.maxHeight = '0px';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.overflow = 'hidden';
        mobileMenu.style.pointerEvents = 'none';

        icon.style.cursor = 'pointer';
        icon.addEventListener('click', () => {
          isOpen = !isOpen;
          if (isOpen) {
            mobileMenu.style.maxHeight = '600px';
            mobileMenu.style.opacity = '1';
            mobileMenu.style.pointerEvents = 'auto';
          } else {
            mobileMenu.style.maxHeight = '0px';
            mobileMenu.style.opacity = '0';
            mobileMenu.style.pointerEvents = 'none';
          }
        });
      }
    });
  }

  // --- 4. CART ACTION ---
  function initCart() {
    const cartButtons = document.querySelectorAll('button[aria-label="Open cart"]');
    cartButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isInSubdir = window.location.pathname.includes('/articles/') ||
                           window.location.pathname.includes('/clothing/') ||
                           window.location.pathname.includes('/store/') ||
                           window.location.pathname.includes('/legal/');
        window.location.href = isInSubdir ? '../checkout.html' : 'checkout.html';
      });
    });
  }

  // Trigger setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCarousels();
      initTickers();
      initMobileMenu();
      initCart();
    });
  } else {
    initCarousels();
    initTickers();
    initMobileMenu();
    initCart();
  }
})();
