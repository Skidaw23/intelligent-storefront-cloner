// =============================================================================
// PERFORMANCE OPTIMIZER - Core Web Vitals and Luxury Experience Balance
// =============================================================================

interface PerformanceConfig {
  lazyLoading?: boolean;
  performanceMode?: 'luxury' | 'balanced' | 'performance';
  enableWebVitalsTracking?: boolean;
  imageOptimization?: boolean;
  cacheStrategy?: 'aggressive' | 'moderate' | 'minimal';
}

export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private observers: IntersectionObserver[] = [];
  private performanceEntries: PerformanceEntry[] = [];
  private vitals: { [key: string]: number } = {};

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      lazyLoading: true,
      performanceMode: 'luxury',
      enableWebVitalsTracking: true,
      imageOptimization: true,
      cacheStrategy: 'moderate',
      ...config
    };
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize lazy loading
      if (this.config.lazyLoading) {
        this.initializeLazyLoading();
      }

      // Initialize image optimization
      if (this.config.imageOptimization) {
        this.initializeImageOptimization();
      }

      // Initialize performance monitoring
      if (this.config.enableWebVitalsTracking) {
        this.initializeWebVitalsTracking();
      }

      // Initialize cache strategies
      this.initializeCacheStrategy();

      // Optimize based on device capabilities
      this.optimizeForDevice();

      console.log('⚡ Performance Optimizer initialized');
      
    } catch (error) {
      console.error('Performance Optimizer initialization failed:', error);
      throw error;
    }
  }

  private initializeLazyLoading(): void {
    // Lazy load images
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });

    // Lazy load videos
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement;
            this.loadVideo(video);
            videoObserver.unobserve(video);
          }
        });
      },
      { rootMargin: '100px 0px' }
    );

    document.querySelectorAll('video[data-src]').forEach((video) => {
      videoObserver.observe(video);
    });

    this.observers.push(imageObserver, videoObserver);
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcset) {
      img.srcset = srcset;
    }

    // Add loading animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    img.onload = () => {
      img.style.opacity = '1';
      img.classList.add('loaded');
    };

    img.onerror = () => {
      img.classList.add('error');
      console.warn('Failed to load image:', src);
    };
  }

  private loadVideo(video: HTMLVideoElement): void {
    const src = video.dataset.src;
    
    if (src) {
      video.src = src;
      video.load();
    }
  }

  private initializeImageOptimization(): void {
    // Add WebP support detection
    this.detectWebPSupport().then((supportsWebP) => {
      if (supportsWebP) {
        document.documentElement.classList.add('webp-supported');
      } else {
        document.documentElement.classList.add('webp-not-supported');
      }
    });

    // Optimize images based on connection speed
    if ((navigator as any).connection) {
      const connection = (navigator as any).connection;
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.documentElement.classList.add('slow-connection');
        this.enableDataSaverMode();
      }
    }

    // Progressive image enhancement
    this.enhanceProgressiveImages();
  }

  private async detectWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  private enableDataSaverMode(): void {
    // Reduce image quality for slow connections
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      const originalSrc = element.dataset.src;
      
      if (originalSrc && originalSrc.includes('shopify.com')) {
        // Reduce Shopify image quality
        element.dataset.src = originalSrc.replace(/width=\d+/, 'width=800');
      }
    });

    // Pause autoplay videos
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach((video) => {
      (video as HTMLVideoElement).removeAttribute('autoplay');
    });
  }

  private enhanceProgressiveImages(): void {
    // Create low-quality placeholders while high-quality images load
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      const src = element.dataset.src;
      
      if (src && src.includes('shopify.com')) {
        // Create LQIP (Low Quality Image Placeholder)
        const lqipSrc = src.replace(/width=\d+/, 'width=50').replace(/height=\d+/, 'height=50');
        element.src = lqipSrc;
        element.classList.add('lqip');
      }
    });
  }

  private initializeWebVitalsTracking(): void {
    // Track Core Web Vitals
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    this.trackFCP();
    this.trackTTFB();
  }

  private trackLCP(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.vitals.LCP = entry.startTime;
        
        // Log warning if LCP is poor
        if (entry.startTime > 4000) {
          console.warn('⚠️ Poor LCP detected:', entry.startTime);
          this.optimizeLCP();
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP tracking not supported');
    }
  }

  private trackFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingStart - entry.startTime;
        this.vitals.FID = fid;
        
        if (fid > 300) {
          console.warn('⚠️ Poor FID detected:', fid);
          this.optimizeFID();
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID tracking not supported');
    }
  }

  private trackCLS(): void {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsEntries.push(entry);
          clsValue += (entry as any).value;
        }
      }
      
      this.vitals.CLS = clsValue;
      
      if (clsValue > 0.25) {
        console.warn('⚠️ Poor CLS detected:', clsValue);
        this.optimizeCLS();
      }
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS tracking not supported');
    }
  }

  private trackFCP(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.vitals.FCP = entry.startTime;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP tracking not supported');
    }
  }

  private trackTTFB(): void {
    if ('navigation' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.vitals.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
    }
  }

  private optimizeLCP(): void {
    // Optimize Largest Contentful Paint
    const images = document.querySelectorAll('img');
    const largestImage = Array.from(images).reduce((largest, img) => {
      const rect = img.getBoundingClientRect();
      const area = rect.width * rect.height;
      const largestRect = largest.getBoundingClientRect();
      const largestArea = largestRect.width * largestRect.height;
      
      return area > largestArea ? img : largest;
    });

    if (largestImage) {
      largestImage.loading = 'eager';
      largestImage.fetchPriority = 'high' as any;
    }
  }

  private optimizeFID(): void {
    // Optimize First Input Delay
    // Break up long tasks
    const longTasks = this.performanceEntries.filter(entry => 
      entry.entryType === 'measure' && entry.duration > 50
    );

    if (longTasks.length > 0) {
      console.log('🐌 Long tasks detected, implementing task scheduling');
      this.implementTaskScheduling();
    }
  }

  private optimizeCLS(): void {
    // Optimize Cumulative Layout Shift
    const images = document.querySelectorAll('img:not([width]):not([height])');
    
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      
      // Set aspect ratio to prevent layout shift
      element.style.aspectRatio = '16 / 9'; // Default aspect ratio
      
      element.onload = () => {
        element.style.aspectRatio = `${element.naturalWidth} / ${element.naturalHeight}`;
      };
    });
  }

  private implementTaskScheduling(): void {
    // Use scheduler API if available, otherwise fall back to setTimeout
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(() => {
        // Schedule non-critical tasks
      }, { priority: 'background' });
    } else {
      // Fall back to setTimeout
      const scheduleTask = (callback: Function) => {
        setTimeout(callback, 0);
      };
      
      // Use for non-critical operations
      (window as any).scheduleNonCriticalTask = scheduleTask;
    }
  }

  private initializeCacheStrategy(): void {
    // Implement caching based on strategy
    switch (this.config.cacheStrategy) {
      case 'aggressive':
        this.implementAggressiveCaching();
        break;
      case 'moderate':
        this.implementModerateCaching();
        break;
      case 'minimal':
        this.implementMinimalCaching();
        break;
    }
  }

  private implementAggressiveCaching(): void {
    // Cache everything possible
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-rolex-aggressive.js')
        .then(registration => {
          console.log('Aggressive SW registered');
        })
        .catch(error => {
          console.warn('SW registration failed:', error);
        });
    }
  }

  private implementModerateCaching(): void {
    // Cache essential resources
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-rolex-moderate.js')
        .then(registration => {
          console.log('Moderate SW registered');
        })
        .catch(error => {
          console.warn('SW registration failed:', error);
        });
    }
  }

  private implementMinimalCaching(): void {
    // Only cache critical resources
    const criticalResources = [
      '/assets/rolex-theme.bundle.js',
      '/assets/rolex-theme.css'
    ];
    
    if ('caches' in window) {
      caches.open('rolex-critical-v1').then(cache => {
        cache.addAll(criticalResources);
      });
    }
  }

  private optimizeForDevice(): void {
    // Adjust performance based on device capabilities
    const connection = (navigator as any).connection;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 2;

    // Adjust quality based on device specs
    if (memory < 2 || hardwareConcurrency < 4) {
      this.enableLowPowerMode();
    }

    if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
      this.enableDataSaverMode();
    }
  }

  private enableLowPowerMode(): void {
    document.documentElement.classList.add('low-power-mode');
    
    // Reduce animation complexity
    document.documentElement.style.setProperty('--rolex-animation-duration', '0.2s');
    
    // Disable non-essential animations
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
      (element as HTMLElement).dataset.animateDisabled = 'true';
    });
  }

  public getVitals(): { [key: string]: number } {
    return { ...this.vitals };
  }

  public reportVitals(): void {
    console.table(this.vitals);
    
    // Send to analytics
    if ((window as any).gtag) {
      Object.entries(this.vitals).forEach(([metric, value]) => {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: metric,
          value: Math.round(value)
        });
      });
    }
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}