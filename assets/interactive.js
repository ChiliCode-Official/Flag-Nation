/**
 * Flag Nation Interactive Engine
 * Restores full native interactivity (Carousel, Rotators, Tickers, Mobile Menu, Cart)
 * 100% offline, standalone and optimized for GitHub Pages.
 */

(function () {
  'use strict';

  // --- 1. EDITORIAL CAROUSEL RESTORATION ---
  function normalizeLocalImageSources() {
    document.querySelectorAll('img[src*="./assets/images/"]').forEach(img => {
      const source = img.getAttribute('src');
      if (!source || !source.includes('?')) return;
      img.setAttribute('src', source.split('?')[0]);
      img.removeAttribute('srcset');
    });
  }

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
      
            // Custom stories data with user content
      const defaultStories = [
        {
          title: "El flag está cambiando frente a nosotros",
          badge: "ORANGE BOWL 2026",
          desc: "Más ciudades. Más generaciones. Más competencia. Más historias. El Orange Bowl fue otro escenario para comprobarlo."
        },
        {
          title: "Orange Bowl 2026 — Team Portraits. Rebels",
          badge: "REBELS FLAG FOOTBALL",
          desc: "Retratos de equipo y la intensidad de la categoría femenil y varonil en el emparrillado."
        },
        {
          title: "Cada jugada, cada carrera, cada segundo dentro del campo suma.",
          badge: "EN CADA JUGADA",
          desc: "Velocidad, concentración y entrega absoluta en cada yarda recorrida."
        },
        {
          title: "Where we’re headed in our debut season",
          badge: "TEMPORADA 2026",
          desc: "El camino y objetivos de los nuevos equipos en la liga."
        }
      ];

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
          if (defaultStories[currentIndex]) {
            if (articleTitle) articleTitle.textContent = defaultStories[currentIndex].title;
            if (articleBadge) articleBadge.textContent = defaultStories[currentIndex].badge;
            if (articleSubtitle) articleSubtitle.textContent = defaultStories[currentIndex].desc;
          } else {
            if (articleTitle && stories[currentIndex].title) articleTitle.textContent = stories[currentIndex].title;
            if (articleBadge && stories[currentIndex].badge) articleBadge.textContent = stories[currentIndex].badge;
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
      if (ul.offsetParent === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

      // Empezamos en la segunda copia y avanzamos hacia cero: el riel entra por
      // la izquierda y sale por la derecha sin mostrar un salto vacío.
      let pos = -(ul.scrollWidth / 2);
      const speed = 0.65; // pixels per frame

      function animate() {
        pos += speed;
        const halfWidth = ul.scrollWidth / 2;
        if (halfWidth > 0 && pos >= 0) {
          pos = -halfWidth;
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
      if (icon.dataset.menuInitialized === 'true') return;
      icon.dataset.menuInitialized = 'true';
      const navContainer = icon.closest('.framer-BIi1o') || icon.closest('nav') || document.body;
      const mobileMenu = navContainer.querySelector('[data-framer-name="Mobile Menu"]');

      if (mobileMenu) {
        let isOpen = false;
        if (!mobileMenu.id) mobileMenu.id = 'flag-mobile-menu';
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('aria-expanded', 'false');
        icon.setAttribute('aria-controls', mobileMenu.id);
        mobileMenu.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
        mobileMenu.style.maxHeight = '0px';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.overflow = 'hidden';
        mobileMenu.style.pointerEvents = 'none';

        icon.style.cursor = 'pointer';
        const setMenuState = (nextState) => {
          isOpen = nextState;
          icon.setAttribute('aria-expanded', String(isOpen));
          mobileMenu.classList.toggle('is-open', isOpen);
          mobileMenu.style.maxHeight = isOpen ? 'calc(100dvh - 88px)' : '0px';
          mobileMenu.style.opacity = isOpen ? '1' : '0';
          mobileMenu.style.pointerEvents = isOpen ? 'auto' : 'none';
        };
        const toggleMenu = (event) => { event.preventDefault(); setMenuState(!isOpen); };
        icon.addEventListener('click', toggleMenu);
        icon.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') toggleMenu(event);
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => setMenuState(false));
        });
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && isOpen) setMenuState(false);
        });
        setMenuState(false);
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

  
  // --- 5. SPONSORS CONTINUOUS ROTATOR / TICKER ---
  function initSponsorsTicker() {
    const sponsorsUls = document.querySelectorAll('ul.sponsors-ticker-ul');
    sponsorsUls.forEach(ul => {
      if (ul.offsetParent === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      ul.style.opacity = '1';
      ul.style.display = 'flex';
      ul.style.willChange = 'transform';

      const parent = ul.parentElement;
      if (parent) {
        parent.style.overflow = 'hidden';
        parent.style.opacity = '1';
      }

      // Clone elements twice to guarantee seamless infinite scrolling
      const items = Array.from(ul.children);
      for (let c = 0; c < 2; c++) {
        items.forEach(item => {
          ul.appendChild(item.cloneNode(true));
        });
      }

      let pos = 0;
      const speed = 0.85; // pixels per frame

      function animate() {
        pos -= speed;
        const oneSetWidth = ul.scrollWidth / 3;
        if (oneSetWidth > 0 && Math.abs(pos) >= oneSetWidth) {
          pos = 0;
        }
        ul.style.transform = 'translateX(' + pos + 'px)';
        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    });
  }

  // Trigger setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      normalizeLocalImageSources();
      initCarousels();
      initTickers();
      initMobileMenu();
      initCart();
      initSponsorsTicker();
    });
  } else {
    normalizeLocalImageSources();
    initCarousels();
    initTickers();
    initMobileMenu();
    initCart();
    initSponsorsTicker();
  }
})();
