// Animation utilities for Royal Equips theme
window.theme = window.theme || {};

window.theme.animations = {
  // Initialize all animations
  init: function() {
    this.setupRevealAnimations();
    this.setupScrollTriggers();
    this.setupHoverEffects();
    this.handleReducedMotion();
  },

  // Setup reveal on scroll animations
  setupRevealAnimations: function() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    if (!revealElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationType = element.dataset.reveal || 'fade-in';
          const delay = parseInt(element.dataset.revealDelay) || 0;
          
          setTimeout(() => {
            element.classList.add('is-revealed');
            element.classList.add(`animate-${animationType}`);
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      observer.observe(element);
    });
  },

  // Setup scroll-triggered animations
  setupScrollTriggers: function() {
    let ticking = false;

    const updateScrollAnimations = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;

      // Parallax elements
      document.querySelectorAll('[data-parallax]').forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrollY * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });

      // Scale on scroll
      document.querySelectorAll('[data-scale-scroll]').forEach(element => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - windowHeight / 2);
        const scale = Math.max(0.8, 1 - (distance / windowHeight) * 0.2);
        element.style.transform = `scale(${scale})`;
      });

      // Fade on scroll
      document.querySelectorAll('[data-fade-scroll]').forEach(element => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - windowHeight / 2);
        const opacity = Math.max(0, 1 - (distance / windowHeight));
        element.style.opacity = opacity;
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
  },

  // Setup hover effects
  setupHoverEffects: function() {
    // Magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0)';
      });
    });

    // Tilt effect
    document.querySelectorAll('[data-tilt]').forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  },

  // Handle reduced motion preferences
  handleReducedMotion: function() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Disable complex animations
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      
      // Remove parallax effects
      document.querySelectorAll('[data-parallax]').forEach(element => {
        element.removeAttribute('data-parallax');
      });
      
      // Simplify reveals
      document.querySelectorAll('[data-reveal]').forEach(element => {
        element.classList.add('is-revealed');
      });
    }
  },

  // Animate element into view
  animateIn: function(element, animation = 'fade-in', delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        element.classList.add('is-revealed');
        element.classList.add(`animate-${animation}`);
        
        // Wait for animation to complete
        const duration = getComputedStyle(element).animationDuration;
        const ms = parseFloat(duration) * 1000;
        setTimeout(resolve, ms);
      }, delay);
    });
  },

  // Animate element out of view
  animateOut: function(element, animation = 'fade-out') {
    return new Promise((resolve) => {
      element.classList.add(`animate-${animation}`);
      
      const duration = getComputedStyle(element).animationDuration;
      const ms = parseFloat(duration) * 1000;
      setTimeout(() => {
        element.classList.remove('is-revealed');
        element.classList.remove(`animate-${animation}`);
        resolve();
      }, ms);
    });
  },

  // Stagger animations
  staggerIn: function(elements, animation = 'fade-in', staggerDelay = 100) {
    elements.forEach((element, index) => {
      this.animateIn(element, animation, index * staggerDelay);
    });
  },

  // Create loading animation
  createLoadingAnimation: function(container) {
    const loader = document.createElement('div');
    loader.className = 'royal-loader';
    loader.innerHTML = `
      <div class="royal-loader-ring"></div>
      <div class="royal-loader-text">Loading...</div>
    `;
    
    container.appendChild(loader);
    return loader;
  },

  // Remove loading animation
  removeLoadingAnimation: function(loader) {
    if (loader && loader.parentNode) {
      this.animateOut(loader, 'fade-out').then(() => {
        loader.remove();
      });
    }
  }
};

// CSS for animations
const animationStyles = `
  /* Base animation states */
  [data-reveal] {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  [data-reveal].is-revealed {
    opacity: 1;
    transform: translateY(0);
  }

  /* Animation variations */
  .animate-fade-in {
    animation: fadeIn 0.6s ease forwards;
  }

  .animate-fade-out {
    animation: fadeOut 0.3s ease forwards;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.6s ease forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.6s ease forwards;
  }

  .animate-slide-in-up {
    animation: slideInUp 0.6s ease forwards;
  }

  .animate-slide-in-down {
    animation: slideInDown 0.6s ease forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }

  .animate-bounce-in {
    animation: bounceIn 0.6s ease forwards;
  }

  .animate-rotate-in {
    animation: rotateIn 0.6s ease forwards;
  }

  /* Keyframes */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes rotateIn {
    from { opacity: 0; transform: rotate(-180deg) scale(0.8); }
    to { opacity: 1; transform: rotate(0deg) scale(1); }
  }

  /* Loading animations */
  .royal-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #c0c0c0;
  }

  .royal-loader-ring {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 191, 255, 0.1);
    border-top: 3px solid #00bfff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .royal-loader-text {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Hover effects */
  [data-magnetic] {
    transition: transform 0.3s ease;
  }

  [data-tilt] {
    transition: transform 0.1s ease;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    [data-reveal],
    [data-parallax],
    [data-magnetic],
    [data-tilt] {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.theme.animations.init();
  });
} else {
  window.theme.animations.init();
}