// Global utilities for Royal Equips theme
window.theme = window.theme || {};

window.theme.utils = {
  // Debounce function calls
  debounce: function(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  // Throttle function calls
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Get viewport dimensions
  getViewportSize: function() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  },

  // Check if element is in viewport
  isInViewport: function(element) {
    const rect = element.getBoundingClientRect();
    const viewport = this.getViewportSize();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewport.height &&
      rect.right <= viewport.width
    );
  },

  // Smooth scroll to element
  scrollToElement: function(element, offset = 0) {
    const elementTop = element.offsetTop - offset;
    
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    });
  },

  // Format price
  formatPrice: function(price, format) {
    if (typeof price === 'string') {
      price = price.replace(/[^\d]/g, '');
    }
    
    const cents = parseInt(price);
    const dollars = (cents / 100).toFixed(2);
    
    if (format) {
      return format.replace('{{amount}}', dollars);
    }
    
    return `$${dollars}`;
  },

  // Parse URL parameters
  getUrlParams: function() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    for (let [key, value] of urlParams) {
      params[key] = value;
    }
    
    return params;
  },

  // Set URL parameter
  setUrlParam: function(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  },

  // Remove URL parameter
  removeUrlParam: function(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  },

  // Check device type
  isMobile: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if touch device
  isTouchDevice: function() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Preload image
  preloadImage: function(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  // Load script dynamically
  loadScript: function(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Generate unique ID
  generateId: function(prefix = 'royal') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Cookie utilities
  getCookie: function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  },

  setCookie: function(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  // Local storage utilities
  getStorage: function(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  },

  setStorage: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Local storage not available');
    }
  },

  // Animation frame utilities
  requestAnimFrame: function(callback) {
    return window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || 
           function(callback) { window.setTimeout(callback, 1000 / 60); };
  }(),

  // Performance timing
  mark: function(name) {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },

  measure: function(name, startMark, endMark) {
    if (window.performance && window.performance.measure) {
      window.performance.measure(name, startMark, endMark);
    }
  }
};

// Initialize performance monitoring
window.theme.utils.mark('royal-theme-start');