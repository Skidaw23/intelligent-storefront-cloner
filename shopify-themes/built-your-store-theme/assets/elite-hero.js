/**
 * Elite Hero Section JavaScript
 * Luxury interactions inspired by Rolex.com premium UX patterns
 * Royal Equips Automotive Theme
 */

class EliteHero {
  constructor(element) {
    this.element = element;
    this.sectionId = element.dataset.sectionId;
    this.animationType = element.dataset.animation || 'fade';
    this.video = element.querySelector('.elite-hero__video');
    this.scrollIndicator = element.querySelector('.elite-hero__scroll-indicator');
    this.parallaxElements = element.querySelectorAll('.elite-hero__image, .elite-hero__video');
    
    this.isParallaxEnabled = element.classList.contains('elite-hero--parallax');
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupScrollIndicator();
    this.setupVideoControls();
    this.setupParallax();
    this.setupResizeHandler();
    this.setupAccessibility();
    
    // Announce section load for screen readers
    this.announceToScreenReader('Hero section loaded');
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window && !this.isReducedMotion) {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateContent();
            observer.unobserve(entry.target);
          }
        });
      }, options);

      observer.observe(this.element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.animateContent();
    }
  }

  animateContent() {
    const contentElements = this.element.querySelectorAll('[data-aos]');
    
    contentElements.forEach((element, index) => {
      if (this.isReducedMotion) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        return;
      }

      const delay = parseInt(element.dataset.aosDelay) || index * 200;
      const animation = element.dataset.aos || this.animationType;

      setTimeout(() => {
        element.classList.add('aos-animate');
        this.applyAnimation(element, animation);
      }, delay);
    });
  }

  applyAnimation(element, animationType) {
    const animations = {
      'fade': {
        opacity: '1',
        transform: 'none'
      },
      'fade-up': {
        opacity: '1',
        transform: 'translateY(0)'
      },
      'fade-down': {
        opacity: '1',
        transform: 'translateY(0)'
      },
      'slide-left': {
        opacity: '1',
        transform: 'translateX(0)'
      },
      'slide-right': {
        opacity: '1',
        transform: 'translateX(0)'
      },
      'zoom-in': {
        opacity: '1',
        transform: 'scale(1)'
      }
    };

    const animationProps = animations[animationType] || animations['fade'];
    
    Object.keys(animationProps).forEach(prop => {
      element.style[prop] = animationProps[prop];
    });

    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  setupScrollIndicator() {
    if (!this.scrollIndicator) return;

    this.scrollIndicator.addEventListener('click', () => {
      const nextSection = this.element.nextElementSibling;
      if (nextSection) {
        const offsetTop = nextSection.offsetTop;
        
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        } else {
          // Fallback smooth scroll for older browsers
          this.smoothScrollTo(offsetTop);
        }
      }
    });

    // Hide scroll indicator when user starts scrolling
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      this.scrollIndicator.style.opacity = '0.3';
      
      scrollTimer = setTimeout(() => {
        this.scrollIndicator.style.opacity = '0.8';
      }, 1000);
    }, { passive: true });
  }

  setupVideoControls() {
    if (!this.video) return;

    // Pause video when section is not visible
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.playVideo();
        } else {
          this.pauseVideo();
        }
      });
    }, {
      threshold: 0.5
    });

    videoObserver.observe(this.element);

    // Pause video on window blur (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseVideo();
      } else {
        this.playVideo();
      }
    });
  }

  playVideo() {
    if (!this.video) return;
    
    if (this.video.tagName === 'VIDEO') {
      this.video.play().catch(e => {
        console.log('Video autoplay prevented:', e);
      });
    }
  }

  pauseVideo() {
    if (!this.video) return;
    
    if (this.video.tagName === 'VIDEO') {
      this.video.pause();
    }
  }

  setupParallax() {
    if (!this.isParallaxEnabled || this.isReducedMotion || window.innerWidth <= 768) {
      return;
    }

    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const elementTop = this.element.offsetTop;
      const elementHeight = this.element.offsetHeight;
      const windowHeight = window.innerHeight;

      // Only apply parallax when section is in view
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const speed = 0.5;
        const yPos = -(scrolled - elementTop) * speed;
        
        this.parallaxElements.forEach(element => {
          element.style.transform = `translateY(${yPos}px)`;
        });
      }

      ticking = false;
    };

    const requestParallaxUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  }

  setupResizeHandler() {
    let resizeTimer;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  handleResize() {
    // Disable parallax on mobile
    if (this.isParallaxEnabled && window.innerWidth <= 768) {
      this.parallaxElements.forEach(element => {
        element.style.transform = '';
      });
    }

    // Update video aspect ratio if needed
    if (this.video && this.video.tagName === 'IFRAME') {
      this.updateVideoAspectRatio();
    }
  }

  updateVideoAspectRatio() {
    if (!this.video) return;
    
    const container = this.video.parentElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const videoAspectRatio = 16 / 9; // Most common video aspect ratio
    
    const containerAspectRatio = containerWidth / containerHeight;
    
    if (containerAspectRatio > videoAspectRatio) {
      // Container is wider than video aspect ratio
      this.video.style.width = '100%';
      this.video.style.height = 'auto';
    } else {
      // Container is taller than video aspect ratio
      this.video.style.width = 'auto';
      this.video.style.height = '100%';
    }
  }

  setupAccessibility() {
    // Add keyboard navigation for scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.setAttribute('tabindex', '0');
      this.scrollIndicator.setAttribute('role', 'button');
      this.scrollIndicator.setAttribute('aria-label', 'Scroll to next section');

      this.scrollIndicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollIndicator.click();
        }
      });
    }

    // Ensure proper contrast for text over images
    this.checkTextContrast();
  }

  checkTextContrast() {
    const contentWrapper = this.element.querySelector('.elite-hero__content-wrapper');
    if (!contentWrapper) return;

    // Add high-contrast class if needed
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.element.classList.add('elite-hero--high-contrast');
    }
  }

  smoothScrollTo(targetY) {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const duration = 1000;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = this.easeInOutCubic(progress);
      
      window.scrollTo(0, startY + (difference * ease));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Public methods for external control
  pause() {
    this.pauseVideo();
  }

  play() {
    this.playVideo();
  }

  destroy() {
    // Clean up event listeners and observers
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }
}

// Auto-initialize all elite hero sections
document.addEventListener('DOMContentLoaded', () => {
  const eliteHeroSections = document.querySelectorAll('.elite-hero');
  
  eliteHeroSections.forEach(section => {
    new EliteHero(section);
  });
});

// Handle Shopify theme editor
if (typeof window.Shopify !== 'undefined' && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (e) => {
    const section = e.target.querySelector('.elite-hero');
    if (section) {
      new EliteHero(section);
    }
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EliteHero;
}

// Set initial styles for elements that will be animated
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const elementsToAnimate = document.querySelectorAll('[data-aos]');
    
    elementsToAnimate.forEach(element => {
      const animationType = element.dataset.aos || 'fade';
      
      // Set initial states based on animation type
      switch (animationType) {
        case 'fade-up':
          element.style.opacity = '0';
          element.style.transform = 'translateY(40px)';
          break;
        case 'fade-down':
          element.style.opacity = '0';
          element.style.transform = 'translateY(-40px)';
          break;
        case 'slide-left':
          element.style.opacity = '0';
          element.style.transform = 'translateX(-40px)';
          break;
        case 'slide-right':
          element.style.opacity = '0';
          element.style.transform = 'translateX(40px)';
          break;
        case 'zoom-in':
          element.style.opacity = '0';
          element.style.transform = 'scale(0.8)';
          break;
        default:
          element.style.opacity = '0';
      }
    });
  }
});