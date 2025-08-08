// =============================================================================
// ACCESSIBILITY CONTROLLER - WCAG 2.1 AA Compliance
// =============================================================================

export class AccessibilityController {
  private initialized = false;
  private focusTrap: HTMLElement | null = null;
  private reducedMotion = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.checkReducedMotionPreference();
      this.enhanceKeyboardNavigation();
      this.improveColorContrast();
      this.addAriaLabels();
      this.setupFocusManagement();
      
      this.initialized = true;
      console.log('♿ Accessibility Controller initialized');
    } catch (error) {
      console.error('Accessibility Controller initialization failed:', error);
      throw error;
    }
  }

  private checkReducedMotionPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mediaQuery.matches;
    
    mediaQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      document.body.classList.toggle('rolex-reduced-motion', this.reducedMotion);
    });
    
    document.body.classList.toggle('rolex-reduced-motion', this.reducedMotion);
  }

  private enhanceKeyboardNavigation(): void {
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    
    interactiveElements.forEach((element) => {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    });

    // Add keyboard event handlers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }
    });
  }

  private handleEscapeKey(): void {
    // Close modals, dropdowns, etc.
    const openModals = document.querySelectorAll('.rolex-modal.is-open');
    openModals.forEach((modal) => {
      (modal as HTMLElement).classList.remove('is-open');
    });
  }

  private handleTabKey(e: KeyboardEvent): void {
    if (this.focusTrap) {
      const focusableElements = this.focusTrap.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  }

  private improveColorContrast(): void {
    // Check if high contrast is needed
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (highContrast) {
      document.body.classList.add('rolex-high-contrast');
    }
  }

  private addAriaLabels(): void {
    // Add missing ARIA labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach((button) => {
      const text = button.textContent?.trim();
      if (text) {
        button.setAttribute('aria-label', text);
      }
    });

    // Add ARIA roles where missing
    const nav = document.querySelector('nav:not([role])');
    if (nav) {
      nav.setAttribute('role', 'navigation');
    }

    const main = document.querySelector('main:not([role])');
    if (main) {
      main.setAttribute('role', 'main');
    }
  }

  private setupFocusManagement(): void {
    // Manage focus for single-page app navigation
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            (target as HTMLElement).focus({ preventScroll: false });
          }
        }
      });
    });
  }

  public setFocusTrap(element: HTMLElement): void {
    this.focusTrap = element;
  }

  public removeFocusTrap(): void {
    this.focusTrap = null;
  }

  public announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  public destroy(): void {
    this.focusTrap = null;
    this.initialized = false;
  }
}