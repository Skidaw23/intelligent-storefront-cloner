/**
 * Royal Equips - Modern JavaScript Core
 * Advanced ES6+ modules with Web APIs and performance optimizations
 */

class RoyalEquipsCore {
  constructor() {
    this.initialized = false;
    this.observers = new Map();
    this.animations = new Map();
    this.components = new Map();
    this.state = new Proxy({}, {
      set: (target, property, value) => {
        target[property] = value;
        this.notifyStateChange(property, value);
        return true;
      }
    });
    
    this.init();
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await this.waitForDOMContentLoaded();
      this.setupModernFeatures();
      this.setupIntersectionObservers();
      this.setupResizeObserver();
      this.setupAnimationSystem();
      this.setupPerformanceOptimizations();
      this.setupAccessibility();
      this.setupErrorHandling();
      this.initializeComponents();
      
      this.initialized = true;
      this.dispatch('royal:initialized');
      
      console.log('🚗 Royal Equips Core initialized successfully');
    } catch (error) {
      console.error('❌ Royal Equips Core initialization failed:', error);
    }
  }

  // Modern DOM Ready Promise
  waitForDOMContentLoaded() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      } else {
        resolve();
      }
    });
  }

  // Setup Modern Web APIs
  setupModernFeatures() {
    // Connection aware loading
    if ('connection' in navigator) {
      this.state.connection = navigator.connection;
      navigator.connection.addEventListener('change', () => {
        this.state.connection = navigator.connection;
        this.adaptToConnection();
      });
    }

    // Battery status awareness
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.state.battery = battery;
        this.adaptToBattery();
      });
    }

    // Device memory awareness
    if ('deviceMemory' in navigator) {
      this.state.deviceMemory = navigator.deviceMemory;
    }

    // Viewport awareness
    this.setupViewportObserver();
  }

  // Advanced Intersection Observer Setup
  setupIntersectionObservers() {
    // Scroll-triggered animations
    this.observers.set('scroll-animation', new IntersectionObserver(
      (entries) => this.handleScrollAnimations(entries),
      {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: '-10% 0px -10% 0px'
      }
    ));

    // Lazy loading observer
    this.observers.set('lazy-load', new IntersectionObserver(
      (entries) => this.handleLazyLoad(entries),
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    ));

    // Performance monitoring observer
    this.observers.set('performance', new IntersectionObserver(
      (entries) => this.handlePerformanceTracking(entries),
      { threshold: 0.5 }
    ));

    this.observeElements();
  }

  observeElements() {
    // Observe scroll-triggered animations
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      this.observers.get('scroll-animation').observe(el);
    });

    // Observe lazy-loadable elements
    document.querySelectorAll('[data-lazy-load]').forEach(el => {
      this.observers.get('lazy-load').observe(el);
    });

    // Observe performance-critical elements
    document.querySelectorAll('[data-track-visibility]').forEach(el => {
      this.observers.get('performance').observe(el);
    });
  }

  // Handle scroll animations with advanced easing
  handleScrollAnimations(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = parseInt(element.dataset.animationDelay) || 0;
        const duration = parseInt(element.dataset.animationDuration) || 800;
        
        setTimeout(() => {
          element.classList.add('is-visible');
          this.triggerMetallicShine(element);
        }, delay);
      }
    });
  }

  // Advanced lazy loading with WebP support
  async handleLazyLoad(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        try {
          if (element.tagName === 'IMG') {
            await this.loadImage(element);
          } else if (element.dataset.lazyComponent) {
            await this.loadComponent(element);
          } else if (element.dataset.lazyVideo) {
            await this.loadVideo(element);
          }
          
          this.observers.get('lazy-load').unobserve(element);
        } catch (error) {
          console.error('Lazy loading failed:', error);
        }
      }
    }
  }

  // Smart image loading with format detection
  async loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src) return;

    // Check WebP support and load appropriate format
    const supportsWebP = await this.supportsWebP();
    let finalSrc = src;
    
    if (supportsWebP && img.dataset.srcWebp) {
      finalSrc = img.dataset.srcWebp;
    }

    return new Promise((resolve, reject) => {
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = finalSrc;
        if (srcset) img.srcset = srcset;
        img.classList.add('loaded');
        resolve();
      };
      
      tempImg.onerror = reject;
      tempImg.src = finalSrc;
    });
  }

  // WebP support detection
  async supportsWebP() {
    if (this.state.supportsWebP !== undefined) {
      return this.state.supportsWebP;
    }

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = () => {
        this.state.supportsWebP = webP.width > 0 && webP.height > 0;
        resolve(this.state.supportsWebP);
      };
      webP.onerror = () => {
        this.state.supportsWebP = false;
        resolve(false);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Resize Observer for responsive behavior
  setupResizeObserver() {
    if (!('ResizeObserver' in window)) return;

    this.observers.set('resize', new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const { width, height } = entry.contentRect;
        
        // Update CSS custom properties for container queries
        element.style.setProperty('--element-width', `${width}px`);
        element.style.setProperty('--element-height', `${height}px`);
        
        // Trigger responsive updates
        this.handleResponsiveUpdates(element, width, height);
      });
    }));

    // Observe responsive containers
    document.querySelectorAll('[data-responsive]').forEach(el => {
      this.observers.get('resize').observe(el);
    });
  }

  // Advanced Animation System
  setupAnimationSystem() {
    this.animationQueue = [];
    this.isAnimating = false;
  }

  async animate(element, keyframes, options = {}) {
    return new Promise((resolve, reject) => {
      if (!element || !element.animate) {
        reject(new Error('Element or animate method not available'));
        return;
      }

      const defaultOptions = {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'both'
      };

      const animation = element.animate(keyframes, { ...defaultOptions, ...options });
      
      animation.addEventListener('finish', resolve, { once: true });
      animation.addEventListener('cancel', reject, { once: true });
      
      this.animations.set(element, animation);
    });
  }

  // Metallic shine effect for luxury feel
  async triggerMetallicShine(element) {
    if (!element.classList.contains('royal-shine-enabled')) return;

    const shine = document.createElement('div');
    shine.className = 'royal-shine-overlay';
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 1;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(shine);

    try {
      await this.animate(shine, [
        { transform: 'translateX(0)' },
        { transform: 'translateX(200%)' }
      ], { duration: 800, easing: 'ease-out' });
    } finally {
      shine.remove();
    }
  }

  // Performance optimizations
  setupPerformanceOptimizations() {
    // Resource hints
    this.addResourceHints();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Setup performance observer
    this.setupPerformanceObserver();
    
    // Memory management
    this.setupMemoryManagement();
  }

  addResourceHints() {
    const hints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://cdn.shopify.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }
    ];

    hints.forEach(hint => {
      if (!document.querySelector(`link[href="${hint.href}"]`)) {
        const link = document.createElement('link');
        Object.assign(link, hint);
        document.head.appendChild(link);
      }
    });
  }

  preloadCriticalResources() {
    // Preload hero images
    document.querySelectorAll('[data-preload]').forEach(element => {
      const src = element.dataset.preload;
      if (src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }

  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        if (clsValue > 0.1) {
          console.warn('🔄 High Cumulative Layout Shift detected:', clsValue);
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('⚠️ Long task detected:', entry.duration + 'ms');
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.log('Performance Observer not fully supported');
    }
  }

  // Memory management
  setupMemoryManagement() {
    // Cleanup observers when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseNonCriticalOperations();
      } else {
        this.resumeOperations();
      }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Accessibility enhancements
  setupAccessibility() {
    // Focus management
    this.setupFocusManagement();
    
    // Screen reader enhancements
    this.setupScreenReaderEnhancements();
    
    // Keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupFocusManagement() {
    // Focus visible polyfill behavior
    document.addEventListener('keydown', () => {
      document.body.classList.add('keyboard-navigation');
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Skip to content link
    this.createSkipToContentLink();
  }

  createSkipToContentLink() {
    if (document.querySelector('.skip-to-content-link')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content-link';
    skipLink.textContent = 'Skip to main content';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Component system
  initializeComponents() {
    // Auto-initialize components
    document.querySelectorAll('[data-component]').forEach(element => {
      const componentName = element.dataset.component;
      this.initializeComponent(componentName, element);
    });
  }

  async initializeComponent(name, element) {
    try {
      const ComponentClass = this.getComponentClass(name);
      if (ComponentClass) {
        const instance = new ComponentClass(element, this);
        this.components.set(element, instance);
        
        if (typeof instance.init === 'function') {
          await instance.init();
        }
      }
    } catch (error) {
      console.error(`Failed to initialize component ${name}:`, error);
    }
  }

  getComponentClass(name) {
    // Component registry - can be extended
    const components = {
      'product-viewer-3d': ProductViewer3D,
      'hero-video': HeroVideo,
      'newsletter': Newsletter,
      'cart-drawer': CartDrawer
    };
    
    return components[name];
  }

  // Event system
  dispatch(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { 
      detail,
      bubbles: true,
      cancelable: true 
    });
    
    document.dispatchEvent(event);
  }

  on(eventName, handler, options = {}) {
    document.addEventListener(eventName, handler, options);
  }

  off(eventName, handler) {
    document.removeEventListener(eventName, handler);
  }

  // State management
  notifyStateChange(property, value) {
    this.dispatch('royal:state-change', { property, value });
  }

  // Utility methods
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Cleanup
  cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Cancel all animations
    this.animations.forEach(animation => animation.cancel());
    this.animations.clear();

    // Cleanup components
    this.components.forEach(component => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components.clear();
  }

  pauseNonCriticalOperations() {
    // Pause animations, reduce observer frequency, etc.
    this.animations.forEach(animation => animation.pause());
  }

  resumeOperations() {
    // Resume paused operations
    this.animations.forEach(animation => animation.play());
  }

  // Network adaptation
  adaptToConnection() {
    const { effectiveType, downlink, rtt } = this.state.connection;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      document.body.classList.add('low-bandwidth');
      // Reduce animation complexity, defer non-critical resources
    } else {
      document.body.classList.remove('low-bandwidth');
    }
  }

  // Battery adaptation
  adaptToBattery() {
    const { level, charging } = this.state.battery;
    
    if (level < 0.2 && !charging) {
      document.body.classList.add('battery-saver');
      // Reduce animations, disable non-critical features
    } else {
      document.body.classList.remove('battery-saver');
    }
  }

  // Error handling
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('JavaScript Error:', event.error);
      this.dispatch('royal:error', { error: event.error });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      this.dispatch('royal:promise-rejection', { reason: event.reason });
    });
  }
}

// Initialize Royal Equips Core
const RoyalCore = new RoyalEquipsCore();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoyalCore;
} else if (typeof window !== 'undefined') {
  window.RoyalCore = RoyalCore;
}

// Component Base Classes (to be extended)
class RoyalComponent {
  constructor(element, core) {
    this.element = element;
    this.core = core;
    this.state = {};
    this.bindings = new Map();
  }

  async init() {
    this.bindEvents();
    await this.render();
  }

  bindEvents() {
    // Override in subclasses
  }

  async render() {
    // Override in subclasses
  }

  destroy() {
    this.bindings.forEach((handler, element) => {
      element.removeEventListener('click', handler);
    });
    this.bindings.clear();
  }

  emit(eventName, detail) {
    this.core.dispatch(eventName, detail);
  }
}

// Export base class
if (typeof window !== 'undefined') {
  window.RoyalComponent = RoyalComponent;
}