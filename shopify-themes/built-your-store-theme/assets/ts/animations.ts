// =============================================================================
// LUXURY ANIMATION CONTROLLER - Advanced GSAP Integration
// =============================================================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { PerformanceOptimizer } from '@utils/PerformanceOptimizer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, MorphSVGPlugin);

interface AnimationConfig {
  enabled?: boolean;
  respectReducedMotion?: boolean;
  performanceOptimizer?: PerformanceOptimizer;
  speed?: 'slow' | 'normal' | 'fast';
}

interface AnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

export class LuxuryAnimationController {
  private config: AnimationConfig;
  private timeline: gsap.core.Timeline;
  private animations: Map<string, gsap.core.Timeline> = new Map();
  private observers: IntersectionObserver[] = [];
  private isReducedMotion = false;
  private speedMultiplier = 1;

  constructor(config: AnimationConfig = {}) {
    this.config = {
      enabled: true,
      respectReducedMotion: true,
      speed: 'normal',
      ...config
    };

    this.checkReducedMotion();
    this.setSpeedMultiplier();
    this.timeline = gsap.timeline({ paused: true });
  }

  public async initialize(): Promise<void> {
    if (!this.config.enabled || this.isReducedMotion) {
      console.log('🎬 Animations disabled due to settings or user preference');
      return;
    }

    // Set GSAP defaults for luxury feel
    gsap.defaults({
      duration: 0.8 * this.speedMultiplier,
      ease: "power3.out"
    });

    // Initialize scroll-based animations
    this.initializeScrollAnimations();
    
    // Initialize page load animations
    this.initializePageAnimations();
    
    // Initialize hover animations
    this.initializeHoverAnimations();
    
    console.log('✨ Luxury Animation Controller initialized');
  }

  private checkReducedMotion(): void {
    if (this.config.respectReducedMotion && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = mediaQuery.matches;
      
      mediaQuery.addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
        if (this.isReducedMotion) {
          this.disableAllAnimations();
        }
      });
    }
  }

  private setSpeedMultiplier(): void {
    switch (this.config.speed) {
      case 'slow':
        this.speedMultiplier = 1.5;
        break;
      case 'fast':
        this.speedMultiplier = 0.5;
        break;
      default:
        this.speedMultiplier = 1;
    }
  }

  private initializeScrollAnimations(): void {
    // Fade in animation for elements with data-animate="fade-in"
    gsap.utils.toArray('[data-animate="fade-in"]').forEach((element: any) => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2 * this.speedMultiplier,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Luxury slide-in animation
    gsap.utils.toArray('[data-animate="slide-luxury"]').forEach((element: any) => {
      const direction = element.dataset.direction || 'left';
      const distance = 100;
      
      const fromProps: any = { opacity: 0 };
      const toProps: any = { opacity: 1 };
      
      switch (direction) {
        case 'left':
          fromProps.x = -distance;
          toProps.x = 0;
          break;
        case 'right':
          fromProps.x = distance;
          toProps.x = 0;
          break;
        case 'up':
          fromProps.y = distance;
          toProps.y = 0;
          break;
        case 'down':
          fromProps.y = -distance;
          toProps.y = 0;
          break;
      }

      gsap.fromTo(element, fromProps, {
        ...toProps,
        duration: 1.5 * this.speedMultiplier,
        ease: "power4.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Staggered animation for collections
    gsap.utils.toArray('[data-animate="stagger"]').forEach((container: any) => {
      const children = container.children;
      const staggerAmount = parseFloat(container.dataset.stagger) || 0.1;
      
      gsap.fromTo(children,
        { 
          opacity: 0, 
          y: 40,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8 * this.speedMultiplier,
          ease: "power3.out",
          stagger: staggerAmount,
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Parallax scrolling for hero sections
    gsap.utils.toArray('[data-animate="parallax"]').forEach((element: any) => {
      const speed = parseFloat(element.dataset.speed) || 0.5;
      
      gsap.to(element, {
        yPercent: -50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // Luxury counter animation
    gsap.utils.toArray('[data-animate="counter"]').forEach((element: any) => {
      const endValue = parseInt(element.dataset.count) || 100;
      const duration = parseFloat(element.dataset.duration) || 2;
      
      gsap.fromTo(element, 
        { textContent: 0 },
        {
          textContent: endValue,
          duration: duration * this.speedMultiplier,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Premium reveal animation with mask
    gsap.utils.toArray('[data-animate="reveal"]').forEach((element: any) => {
      gsap.set(element, { clipPath: 'inset(0 100% 0 0)' });
      
      gsap.to(element, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.6 * this.speedMultiplier,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  private initializePageAnimations(): void {
    // Page load sequence
    const tl = gsap.timeline({ delay: 0.2 });
    
    // Animate navigation
    tl.fromTo('.rolex-header',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 * this.speedMultiplier, ease: "power3.out" }
    );
    
    // Animate hero content
    tl.fromTo('.rolex-hero h1',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 * this.speedMultiplier, ease: "power3.out" },
      "-=0.5"
    );
    
    tl.fromTo('.rolex-hero p',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 * this.speedMultiplier, ease: "power3.out" },
      "-=0.8"
    );
    
    tl.fromTo('.rolex-hero .rolex-button',
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8 * this.speedMultiplier, ease: "back.out(1.7)" },
      "-=0.6"
    );
  }

  private initializeHoverAnimations(): void {
    // Luxury button hovers
    gsap.utils.toArray('.rolex-button').forEach((button: any) => {
      const tl = gsap.timeline({ paused: true });
      
      tl.to(button, {
        y: -3,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      button.addEventListener('mouseenter', () => tl.play());
      button.addEventListener('mouseleave', () => tl.reverse());
    });

    // Product card hovers
    gsap.utils.toArray('.rolex-product-card').forEach((card: any) => {
      const image = card.querySelector('.rolex-product-image');
      const content = card.querySelector('.rolex-product-content');
      
      const tl = gsap.timeline({ paused: true });
      
      tl.to(card, {
        y: -8,
        boxShadow: "0 32px 64px rgba(0,0,0,0.12)",
        duration: 0.4,
        ease: "power3.out"
      })
      .to(image, {
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out"
      }, 0)
      .to(content, {
        y: -5,
        duration: 0.4,
        ease: "power2.out"
      }, 0);
      
      card.addEventListener('mouseenter', () => tl.play());
      card.addEventListener('mouseleave', () => tl.reverse());
    });

    // Navigation link animations
    gsap.utils.toArray('.rolex-nav-link').forEach((link: any) => {
      const underline = link.querySelector('.rolex-nav-underline');
      
      if (underline) {
        gsap.set(underline, { scaleX: 0, transformOrigin: "left center" });
        
        const tl = gsap.timeline({ paused: true });
        tl.to(underline, {
          scaleX: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        
        link.addEventListener('mouseenter', () => tl.play());
        link.addEventListener('mouseleave', () => tl.reverse());
      }
    });
  }

  // Advanced animation methods
  public createLuxuryTransition(from: Element, to: Element, options: AnimationOptions = {}): gsap.core.Timeline {
    const tl = gsap.timeline();
    
    tl.to(from, {
      opacity: 0,
      scale: 0.95,
      y: -20,
      duration: 0.4 * this.speedMultiplier,
      ease: "power2.in"
    })
    .fromTo(to,
      { opacity: 0, scale: 0.95, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6 * this.speedMultiplier,
        ease: "power3.out"
      }
    );
    
    return tl;
  }

  public animateTextReveal(element: Element, text: string, options: AnimationOptions = {}): gsap.core.Timeline {
    const tl = gsap.timeline();
    
    tl.to(element, {
      text: {
        value: text,
        delimiter: ""
      },
      duration: (options.duration || 2) * this.speedMultiplier,
      ease: options.ease || "none"
    });
    
    return tl;
  }

  public createMorphAnimation(fromPath: string, toPath: string, options: AnimationOptions = {}): gsap.core.Timeline {
    const tl = gsap.timeline();
    
    tl.to(fromPath, {
      morphSVG: toPath,
      duration: (options.duration || 1) * this.speedMultiplier,
      ease: options.ease || "power2.inOut"
    });
    
    return tl;
  }

  public createScrollBasedAnimation(element: Element, animation: any, options: AnimationOptions = {}): void {
    const trigger = options.trigger || element;
    
    gsap.to(element, {
      ...animation,
      scrollTrigger: {
        trigger,
        start: options.start || "top 80%",
        end: options.end || "bottom 20%",
        scrub: options.scrub || false,
        toggleActions: "play none none reverse"
      }
    });
  }

  public updateSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    this.config.speed = speed;
    this.setSpeedMultiplier();
    
    // Update existing animations
    gsap.globalTimeline.timeScale(1 / this.speedMultiplier);
  }

  public updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (!this.config.enabled || this.isReducedMotion) {
      this.disableAllAnimations();
    }
  }

  private disableAllAnimations(): void {
    gsap.globalTimeline.kill();
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    // Set immediate styles for accessibility
    gsap.set('[data-animate]', {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      clipPath: 'none'
    });
  }

  public destroy(): void {
    gsap.globalTimeline.kill();
    ScrollTrigger.getAll().forEach(st => st.kill());
    this.observers.forEach(observer => observer.disconnect());
    this.animations.clear();
  }
}

// Global registration
if (typeof window !== 'undefined') {
  (window as any).LuxuryAnimationController = LuxuryAnimationController;
}