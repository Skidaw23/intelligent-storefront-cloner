/**
 * Royal Equips Theme - Main JavaScript
 * Advanced animations, 3D functionality, and luxury interactions
 */

class RoyalEquips {
  constructor() {
    this.init();
    this.setupAnimations();
    this.setup3DViewers();
    this.setupPerformanceOptimizations();
  }

  init() {
    // Initialize core functionality
    this.setupIntersectionObserver();
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupLazyLoading();
  }

  // Intersection Observer for scroll animations
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Add staggered animations for child elements
          const children = entry.target.querySelectorAll('[data-animate-delay]');
          children.forEach((child, index) => {
            const delay = child.dataset.animateDelay || index * 100;
            setTimeout(() => {
              child.classList.add('is-visible');
            }, delay);
          });
        }
      });
    }, options);

    // Observe all animation elements
    const animatedElements = document.querySelectorAll('[class*="royal-fade-in"], [class*="royal-slide-in"], [class*="royal-scale-in"]');
    animatedElements.forEach(el => this.observer.observe(el));
  }

  // Advanced scroll animations
  setupScrollAnimations() {
    let ticking = false;

    const updateScrollAnimations = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      // Parallax effects
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const yPos = -(scrollY * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });

      // Fade on scroll
      const fadeElements = document.querySelectorAll('[data-fade-scroll]');
      fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const opacity = Math.max(0, Math.min(1, 1 - (Math.abs(rect.top - windowHeight/2) / windowHeight)));
        el.style.opacity = opacity;
      });

      // Scale on scroll
      const scaleElements = document.querySelectorAll('[data-scale-scroll]');
      scaleElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const scale = Math.max(0.8, Math.min(1, 1 - (Math.abs(rect.top - windowHeight/2) / windowHeight) * 0.2));
        el.style.transform = `scale(${scale})`;
      });

      ticking = false;
    };

    const requestScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollAnimations);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    updateScrollAnimations(); // Initial call
  }

  // Hover effects with metallic shine
  setupHoverEffects() {
    const cards = document.querySelectorAll('.royal-card, .product-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.addMetallicShine(e.target);
      });

      card.addEventListener('mousemove', (e) => {
        this.updateShinePosition(e);
      });

      card.addEventListener('mouseleave', (e) => {
        this.removeMetallicShine(e.target);
      });
    });
  }

  addMetallicShine(element) {
    const shine = document.createElement('div');
    shine.className = 'royal-shine';
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle 100px at var(--x, 50%) var(--y, 50%), rgba(0, 191, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    element.style.position = 'relative';
    element.appendChild(shine);
    
    requestAnimationFrame(() => {
      shine.style.opacity = '1';
    });
  }

  updateShinePosition(e) {
    const shine = e.currentTarget.querySelector('.royal-shine');
    if (shine) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      shine.style.setProperty('--x', `${x}%`);
      shine.style.setProperty('--y', `${y}%`);
    }
  }

  removeMetallicShine(element) {
    const shine = element.querySelector('.royal-shine');
    if (shine) {
      shine.style.opacity = '0';
      setTimeout(() => {
        shine.remove();
      }, 300);
    }
  }

  // 3D Model Viewers
  setup3DViewers() {
    const viewers = document.querySelectorAll('.royal-3d-viewer');
    
    viewers.forEach(viewer => {
      const model = viewer.querySelector('model-viewer');
      if (model) {
        this.enhance3DViewer(model, viewer);
      }
    });
  }

  enhance3DViewer(modelViewer, container) {
    // Add loading state
    const loadingOverlay = this.create3DLoading(container);
    
    modelViewer.addEventListener('load', () => {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => loadingOverlay.remove(), 300);
      
      // Add interaction hints
      this.add3DInteractionHints(container);
    });

    modelViewer.addEventListener('error', () => {
      this.show3DError(container);
    });

    // Auto-rotate on idle
    let idleTimer;
    const startAutoRotate = () => {
      modelViewer.setAttribute('auto-rotate', 'true');
    };

    const stopAutoRotate = () => {
      modelViewer.removeAttribute('auto-rotate');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(startAutoRotate, 3000);
    };

    modelViewer.addEventListener('camera-change', stopAutoRotate);
    idleTimer = setTimeout(startAutoRotate, 3000);
  }

  create3DLoading(container) {
    const loading = document.createElement('div');
    loading.className = 'royal-3d-loading';
    loading.innerHTML = `
      <div class="royal-loading-spinner"></div>
      <p>Loading 3D Model...</p>
    `;
    loading.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(26, 26, 26, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #c0c0c0;
      font-size: 0.875rem;
      z-index: 10;
      transition: opacity 0.3s ease;
    `;

    const spinner = loading.querySelector('.royal-loading-spinner');
    spinner.style.cssText = `
      width: 40px;
      height: 40px;
      border: 2px solid rgba(0, 191, 255, 0.1);
      border-top: 2px solid #00bfff;
      border-radius: 50%;
      animation: royal-spin 1s linear infinite;
      margin-bottom: 1rem;
    `;

    container.appendChild(loading);
    return loading;
  }

  add3DInteractionHints(container) {
    const hints = document.createElement('div');
    hints.className = 'royal-3d-hints';
    hints.innerHTML = `
      <div class="hint">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Drag to rotate
      </div>
      <div class="hint">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        Pinch to zoom
      </div>
    `;
    
    hints.style.cssText = `
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      display: flex;
      gap: 1rem;
      opacity: 0.7;
      font-size: 0.75rem;
      color: #c0c0c0;
      pointer-events: none;
    `;

    container.appendChild(hints);

    // Hide hints after interaction
    const modelViewer = container.querySelector('model-viewer');
    const hideHints = () => {
      hints.style.opacity = '0';
      setTimeout(() => hints.remove(), 300);
    };

    modelViewer.addEventListener('camera-change', hideHints, { once: true });
  }

  // Lazy loading optimization
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const videos = document.querySelectorAll('video[data-src]');
    
    const lazyLoadOptions = {
      rootMargin: '50px 0px',
      threshold: 0.1
    };

    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          if (element.tagName === 'IMG') {
            this.lazyLoadImage(element);
          } else if (element.tagName === 'VIDEO') {
            this.lazyLoadVideo(element);
          }
          
          lazyLoadObserver.unobserve(element);
        }
      });
    }, lazyLoadOptions);

    [...images, ...videos].forEach(el => lazyLoadObserver.observe(el));
  }

  lazyLoadImage(img) {
    const placeholder = img.previousElementSibling;
    img.classList.add('royal-loading');
    
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = img.dataset.src;
      img.classList.remove('royal-loading');
      img.classList.add('royal-fade-in', 'is-visible');
      
      if (placeholder && placeholder.classList.contains('royal-placeholder')) {
        placeholder.style.opacity = '0';
        setTimeout(() => placeholder.remove(), 300);
      }
    };
    tempImg.src = img.dataset.src;
  }

  lazyLoadVideo(video) {
    video.src = video.dataset.src;
    video.load();
    video.classList.add('royal-fade-in', 'is-visible');
  }

  // Performance optimizations
  setupPerformanceOptimizations() {
    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    // Prefetch critical resources
    this.prefetchResources();

    // Optimize animations for mobile
    this.optimizeForMobile();
  }

  handleResize() {
    // Update any size-dependent calculations
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(el => {
      el.style.transform = 'translate3d(0, 0, 0)'; // Reset
    });
  }

  prefetchResources() {
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src || img.dataset.src;
      document.head.appendChild(link);
    });
  }

  optimizeForMobile() {
    if ('ontouchstart' in window) {
      document.body.classList.add('touch-device');
      
      // Reduce animation complexity on mobile
      const complexAnimations = document.querySelectorAll('[data-mobile-reduce]');
      complexAnimations.forEach(el => {
        el.style.animationDuration = '0.1s';
      });
    }
  }

  // Product quick view functionality
  openQuickView(productId) {
    fetch(`/products/${productId}.js`)
      .then(response => response.json())
      .then(product => {
        this.createQuickViewModal(product);
      })
      .catch(error => {
        console.error('Error loading product:', error);
      });
  }

  createQuickViewModal(product) {
    const modal = document.createElement('div');
    modal.className = 'royal-modal royal-quick-view';
    modal.innerHTML = `
      <div class="royal-modal-backdrop"></div>
      <div class="royal-modal-content">
        <button class="royal-modal-close">&times;</button>
        <div class="royal-quick-view-content">
          <div class="product-images">
            <img src="${product.featured_image}" alt="${product.title}">
          </div>
          <div class="product-info">
            <h2 class="royal-heading-2">${product.title}</h2>
            <p class="royal-body">${product.description}</p>
            <div class="price">${this.formatPrice(product.price)}</div>
            <button class="royal-btn royal-btn--primary">Add to Cart</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('is-visible');
    });

    // Close functionality
    const closeBtn = modal.querySelector('.royal-modal-close');
    const backdrop = modal.querySelector('.royal-modal-backdrop');
    
    [closeBtn, backdrop].forEach(el => {
      el.addEventListener('click', () => this.closeModal(modal));
    });

    // ESC key close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  closeModal(modal) {
    modal.classList.remove('is-visible');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  // Initialize on DOM ready
  static init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new RoyalEquips());
    } else {
      new RoyalEquips();
    }
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes royal-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .royal-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .royal-modal.is-visible {
    opacity: 1;
    visibility: visible;
  }

  .royal-modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
  }

  .royal-modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    background: var(--gradient-metallic);
    border: 1px solid rgba(192, 192, 192, 0.1);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-xl);
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }

  .royal-modal.is-visible .royal-modal-content {
    transform: scale(1);
  }

  .royal-modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    color: #ffffff;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1;
    transition: var(--transition-base);
  }

  .royal-modal-close:hover {
    background: rgba(0, 191, 255, 0.5);
    transform: scale(1.1);
  }

  .touch-device .royal-card:hover {
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .royal-modal,
    .royal-modal-content {
      transition: none;
    }
  }
`;
document.head.appendChild(style);

// Initialize the Royal Equips theme
RoyalEquips.init();

// Export for external use
window.RoyalEquips = RoyalEquips;