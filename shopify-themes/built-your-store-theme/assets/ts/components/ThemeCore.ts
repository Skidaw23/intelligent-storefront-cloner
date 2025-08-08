// =============================================================================
// THEME CORE COMPONENT - Central Architecture Management
// =============================================================================

import { PerformanceOptimizer } from '@utils/PerformanceOptimizer';
import { RolexThemeConfig } from '../main';

export interface ComponentRegistry {
  [key: string]: any;
}

export class ThemeCore {
  private config: RolexThemeConfig;
  private components: ComponentRegistry = {};
  private sectionObserver: IntersectionObserver | null = null;
  private initialized = false;

  constructor(config: RolexThemeConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize section management
      this.initializeSectionManagement();
      
      // Initialize component registry
      this.initializeComponentRegistry();
      
      // Initialize global event listeners
      this.initializeGlobalEventListeners();
      
      this.initialized = true;
      console.log('🏗️ Theme Core initialized successfully');
      
    } catch (error) {
      console.error('❌ Theme Core initialization failed:', error);
      throw error;
    }
  }

  private initializeSectionManagement(): void {
    // Observe sections for lazy initialization
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.initializeSection(entry.target as HTMLElement);
          }
        });
      },
      { 
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    // Observe all sections
    document.querySelectorAll('[data-section-type]').forEach((section) => {
      this.sectionObserver?.observe(section);
    });
  }

  private initializeSection(section: HTMLElement): void {
    const sectionType = section.dataset.sectionType;
    const sectionId = section.dataset.sectionId;
    
    if (!sectionType || !sectionId) return;

    try {
      switch (sectionType) {
        case 'rolex-cinematic-hero':
          this.initializeCinematicHero(section);
          break;
        case 'rolex-product-showcase':
          this.initializeProductShowcase(section);
          break;
        case 'rolex-collection-grid':
          this.initializeCollectionGrid(section);
          break;
        default:
          console.log(`Unknown section type: ${sectionType}`);
      }
      
      // Mark section as initialized
      section.dataset.initialized = 'true';
      
    } catch (error) {
      console.error(`Failed to initialize section ${sectionType}:`, error);
    }
  }

  private initializeCinematicHero(section: HTMLElement): void {
    // Initialize video optimization
    const video = section.querySelector('.rolex-hero-video') as HTMLVideoElement;
    if (video) {
      this.optimizeVideo(video);
    }

    // Initialize 3D viewer if present
    const viewer3D = section.querySelector('.rolex-3d-container');
    if (viewer3D && (window as any).createWatch3DViewer) {
      this.initialize3DViewer(viewer3D as HTMLElement);
    }

    // Initialize parallax effects
    this.initializeParallax(section);
  }

  private optimizeVideo(video: HTMLVideoElement): void {
    // Optimize video for performance
    const optimizeForConnection = () => {
      const connection = (navigator as any).connection;
      
      if (connection) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          video.pause();
          video.style.display = 'none';
        } else if (connection.effectiveType === '3g') {
          video.playbackRate = 0.8;
        }
      }
    };

    optimizeForConnection();

    // Listen for connection changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', optimizeForConnection);
    }

    // Pause when not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(console.warn);
        } else {
          video.pause();
        }
      });
    });

    observer.observe(video);
  }

  private initialize3DViewer(container: HTMLElement): void {
    const modelUrl = container.dataset['3dModel'];
    if (!modelUrl) return;

    const viewerElement = container.querySelector('.rolex-3d-viewer') as HTMLElement;
    const loadingElement = container.querySelector('.rolex-3d-loading') as HTMLElement;
    
    if (!viewerElement) return;

    try {
      const viewer = (window as any).createWatch3DViewer(viewerElement, modelUrl, {
        environmentUrl: container.dataset['3dEnvironment'],
        quality: container.dataset['3dQuality'] || 'high',
        autoRotate: container.dataset['3dAutorotate'] === 'true'
      }, {
        onProgress: (progress: number) => {
          const progressBar = loadingElement?.querySelector('.rolex-progress-bar') as HTMLElement;
          if (progressBar) {
            progressBar.style.width = `${progress}%`;
          }
        },
        onLoad: () => {
          if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
              loadingElement.style.display = 'none';
            }, 300);
          }
        },
        onError: (error: Error) => {
          console.error('3D viewer error:', error);
          if (loadingElement) {
            loadingElement.innerHTML = '<p>Unable to load 3D model</p>';
          }
        }
      });

      // Store viewer reference
      this.components[`3d-viewer-${container.dataset.sectionId}`] = viewer;
      
    } catch (error) {
      console.error('Failed to initialize 3D viewer:', error);
    }
  }

  private initializeParallax(section: HTMLElement): void {
    const parallaxElements = section.querySelectorAll('[data-animate="parallax"]');
    
    parallaxElements.forEach((element) => {
      const speed = parseFloat((element as HTMLElement).dataset.speed || '0.5');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startParallaxEffect(element as HTMLElement, speed);
          } else {
            this.stopParallaxEffect(element as HTMLElement);
          }
        });
      });

      observer.observe(element);
    });
  }

  private startParallaxEffect(element: HTMLElement, speed: number): void {
    const updateParallax = () => {
      const rect = element.getBoundingClientRect();
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const translateY = scrollPercent * 100 * speed;
      
      element.style.transform = `translate3d(0, ${translateY}px, 0)`;
      
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        requestAnimationFrame(updateParallax);
      }
    };
    
    updateParallax();
  }

  private stopParallaxEffect(element: HTMLElement): void {
    element.style.transform = '';
  }

  private initializeProductShowcase(section: HTMLElement): void {
    // Product hover effects, quick view, etc.
    const productCards = section.querySelectorAll('.rolex-product-card');
    
    productCards.forEach((card) => {
      this.initializeProductCard(card as HTMLElement);
    });
  }

  private initializeProductCard(card: HTMLElement): void {
    const quickViewBtn = card.querySelector('.rolex-quick-view');
    const productImages = card.querySelectorAll('.rolex-product-image img');
    
    // Image hover switching
    if (productImages.length > 1) {
      let currentIndex = 0;
      
      card.addEventListener('mouseenter', () => {
        const interval = setInterval(() => {
          productImages[currentIndex].style.opacity = '0';
          currentIndex = (currentIndex + 1) % productImages.length;
          productImages[currentIndex].style.opacity = '1';
        }, 1000);
        
        card.dataset.imageInterval = interval.toString();
      });
      
      card.addEventListener('mouseleave', () => {
        const interval = parseInt(card.dataset.imageInterval || '0');
        clearInterval(interval);
        
        // Reset to first image
        productImages.forEach((img, index) => {
          (img as HTMLElement).style.opacity = index === 0 ? '1' : '0';
        });
        currentIndex = 0;
      });
    }

    // Quick view functionality
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openQuickView(card);
      });
    }
  }

  private openQuickView(card: HTMLElement): void {
    // Implement quick view modal
    const productHandle = card.dataset.productHandle;
    if (!productHandle) return;

    // This would integrate with Shopify's product API
    console.log('Opening quick view for:', productHandle);
    
    // Emit custom event for other components to listen
    document.dispatchEvent(new CustomEvent('rolex:quickview:open', {
      detail: { productHandle, card }
    }));
  }

  private initializeCollectionGrid(section: HTMLElement): void {
    // Collection filtering, sorting, pagination
    const filterButtons = section.querySelectorAll('.rolex-filter-btn');
    const sortSelect = section.querySelector('.rolex-sort-select') as HTMLSelectElement;
    
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filterCollection(section, (btn as HTMLElement).dataset.filter || '');
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.sortCollection(section, sortSelect.value);
      });
    }
  }

  private filterCollection(section: HTMLElement, filter: string): void {
    const products = section.querySelectorAll('.rolex-product-item');
    
    products.forEach((product) => {
      const productElement = product as HTMLElement;
      const shouldShow = !filter || productElement.dataset.category === filter || filter === 'all';
      
      productElement.style.display = shouldShow ? 'block' : 'none';
    });
  }

  private sortCollection(section: HTMLElement, sortBy: string): void {
    const container = section.querySelector('.rolex-products-grid');
    const products = Array.from(container?.children || []) as HTMLElement[];
    
    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseInt(a.dataset.price || '0') - parseInt(b.dataset.price || '0');
        case 'price-high':
          return parseInt(b.dataset.price || '0') - parseInt(a.dataset.price || '0');
        case 'name':
          return (a.dataset.title || '').localeCompare(b.dataset.title || '');
        case 'newest':
          return new Date(b.dataset.date || '').getTime() - new Date(a.dataset.date || '').getTime();
        default:
          return 0;
      }
    });
    
    // Re-append in sorted order
    products.forEach((product) => {
      container?.appendChild(product);
    });
  }

  private initializeComponentRegistry(): void {
    // Register global components
    this.components.themeCore = this;
    
    // Make components available globally
    (window as any).RolexComponents = this.components;
  }

  private initializeGlobalEventListeners(): void {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D' && this.config.debug) {
        this.toggleDebugMode();
      }
    });

    // Global click tracking for analytics
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('.rolex-button, .rolex-product-card, .rolex-nav-link')) {
        this.trackInteraction(target);
      }
    });

    // Global error handling
    window.addEventListener('error', (e) => {
      if (this.config.debug) {
        console.error('Global error:', e.error);
      }
    });
  }

  private toggleDebugMode(): void {
    document.body.classList.toggle('rolex-debug-mode');
    console.log('🔧 Debug mode toggled');
  }

  private trackInteraction(element: HTMLElement): void {
    // Track user interactions for analytics
    const interactionData = {
      element: element.tagName,
      className: element.className,
      text: element.textContent?.trim() || '',
      timestamp: Date.now()
    };

    // Send to analytics service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'rolex_interaction', {
        event_category: 'engagement',
        event_label: interactionData.className,
        value: 1
      });
    }
  }

  public getComponent<T>(name: string): T | null {
    return this.components[name] || null;
  }

  public registerComponent(name: string, component: any): void {
    this.components[name] = component;
  }

  public destroy(): void {
    this.sectionObserver?.disconnect();
    
    // Clean up all registered components
    Object.values(this.components).forEach((component) => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    
    this.components = {};
    this.initialized = false;
  }
}