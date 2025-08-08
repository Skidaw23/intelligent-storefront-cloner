// =============================================================================
// RESPONSIVE MANAGER - Advanced Viewport and Device Handling
// =============================================================================

interface BreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

interface ResponsiveCallbacks {
  onBreakpointChange?: (current: string, previous: string) => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  onResize?: (width: number, height: number) => void;
}

export class ResponsiveManager {
  private breakpoints: BreakpointConfig[] = [
    { name: 'xs', minWidth: 0, maxWidth: 575 },
    { name: 'sm', minWidth: 576, maxWidth: 767 },
    { name: 'md', minWidth: 768, maxWidth: 991 },
    { name: 'lg', minWidth: 992, maxWidth: 1199 },
    { name: 'xl', minWidth: 1200, maxWidth: 1399 },
    { name: 'xxl', minWidth: 1400 }
  ];

  private currentBreakpoint = '';
  private previousBreakpoint = '';
  private currentOrientation: 'portrait' | 'landscape' = 'portrait';
  private callbacks: ResponsiveCallbacks = {};
  private resizeObserver: ResizeObserver | null = null;
  private debounceTimeout: number | null = null;

  constructor(callbacks: ResponsiveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public async initialize(): Promise<void> {
    try {
      this.updateCurrentBreakpoint();
      this.updateOrientation();
      this.setupEventListeners();
      this.updateCSSCustomProperties();
      
      console.log('📱 Responsive Manager initialized');
    } catch (error) {
      console.error('Responsive Manager initialization failed:', error);
      throw error;
    }
  }

  private updateCurrentBreakpoint(): void {
    const width = window.innerWidth;
    let newBreakpoint = 'xs';

    for (const bp of this.breakpoints) {
      if (width >= bp.minWidth && (!bp.maxWidth || width <= bp.maxWidth)) {
        newBreakpoint = bp.name;
        break;
      }
    }

    if (newBreakpoint !== this.currentBreakpoint) {
      this.previousBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = newBreakpoint;
      
      this.updateBodyClass();
      this.callbacks.onBreakpointChange?.(this.currentBreakpoint, this.previousBreakpoint);
    }
  }

  private updateOrientation(): void {
    const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    
    if (newOrientation !== this.currentOrientation) {
      this.currentOrientation = newOrientation;
      this.updateBodyClass();
      this.callbacks.onOrientationChange?.(this.currentOrientation);
    }
  }

  private updateBodyClass(): void {
    // Remove previous classes
    document.body.className = document.body.className
      .replace(/rolex-bp-\w+/g, '')
      .replace(/rolex-orientation-\w+/g, '');
    
    // Add current classes
    document.body.classList.add(`rolex-bp-${this.currentBreakpoint}`);
    document.body.classList.add(`rolex-orientation-${this.currentOrientation}`);
  }

  private updateCSSCustomProperties(): void {
    const root = document.documentElement;
    
    root.style.setProperty('--rolex-viewport-width', `${window.innerWidth}px`);
    root.style.setProperty('--rolex-viewport-height', `${window.innerHeight}px`);
    root.style.setProperty('--rolex-current-breakpoint', `"${this.currentBreakpoint}"`);
    
    // Update safe areas for mobile devices
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
      root.style.setProperty('--rolex-safe-area-top', 'env(safe-area-inset-top)');
      root.style.setProperty('--rolex-safe-area-bottom', 'env(safe-area-inset-bottom)');
      root.style.setProperty('--rolex-safe-area-left', 'env(safe-area-inset-left)');
      root.style.setProperty('--rolex-safe-area-right', 'env(safe-area-inset-right)');
    }
  }

  private setupEventListeners(): void {
    // Debounced resize handler
    window.addEventListener('resize', () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      
      this.debounceTimeout = window.setTimeout(() => {
        this.updateCurrentBreakpoint();
        this.updateOrientation();
        this.updateCSSCustomProperties();
        this.callbacks.onResize?.(window.innerWidth, window.innerHeight);
      }, 100);
    });

    // Orientation change handler
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateOrientation();
        this.updateCSSCustomProperties();
      }, 100);
    });

    // Setup ResizeObserver for container queries (if supported)
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          this.handleContainerResize(entry);
        });
      });

      // Observe container elements
      document.querySelectorAll('[data-container-query]').forEach((element) => {
        this.resizeObserver?.observe(element);
      });
    }
  }

  private handleContainerResize(entry: ResizeObserverEntry): void {
    const element = entry.target as HTMLElement;
    const width = entry.contentRect.width;
    
    // Apply container-based classes
    element.classList.remove(...Array.from(element.classList).filter(cls => cls.startsWith('rolex-cq-')));
    
    if (width < 400) {
      element.classList.add('rolex-cq-small');
    } else if (width < 800) {
      element.classList.add('rolex-cq-medium');
    } else {
      element.classList.add('rolex-cq-large');
    }
  }

  // Public API methods
  public getCurrentBreakpoint(): string {
    return this.currentBreakpoint;
  }

  public getPreviousBreakpoint(): string {
    return this.previousBreakpoint;
  }

  public getCurrentOrientation(): 'portrait' | 'landscape' {
    return this.currentOrientation;
  }

  public isBreakpoint(breakpoint: string): boolean {
    return this.currentBreakpoint === breakpoint;
  }

  public isBreakpointUp(breakpoint: string): boolean {
    const currentIndex = this.breakpoints.findIndex(bp => bp.name === this.currentBreakpoint);
    const targetIndex = this.breakpoints.findIndex(bp => bp.name === breakpoint);
    return currentIndex >= targetIndex;
  }

  public isBreakpointDown(breakpoint: string): boolean {
    const currentIndex = this.breakpoints.findIndex(bp => bp.name === this.currentBreakpoint);
    const targetIndex = this.breakpoints.findIndex(bp => bp.name === breakpoint);
    return currentIndex <= targetIndex;
  }

  public isMobile(): boolean {
    return this.isBreakpointDown('md');
  }

  public isTablet(): boolean {
    return this.isBreakpoint('md') || this.isBreakpoint('lg');
  }

  public isDesktop(): boolean {
    return this.isBreakpointUp('xl');
  }

  public getViewportDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  public destroy(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.resizeObserver?.disconnect();
    
    // Remove event listeners would require storing references
    // For now, they'll be cleaned up when the page unloads
  }
}

// Global registration
if (typeof window !== 'undefined') {
  (window as any).ResponsiveManager = ResponsiveManager;
}