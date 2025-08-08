// =============================================================================
// MAIN ROLEX THEME TYPESCRIPT ENTRY POINT
// Advanced Architecture with Dependency Injection
// =============================================================================

import { ThemeCore } from '@components/ThemeCore';
import { LuxuryAnimationController } from '@components/LuxuryAnimationController';
import { ResponsiveManager } from '@components/ResponsiveManager';
import { PerformanceOptimizer } from '@utils/PerformanceOptimizer';
import { SEOEnhancer } from '@utils/SEOEnhancer';
import { AccessibilityController } from '@utils/AccessibilityController';

// Type Definitions
interface RolexThemeConfig {
  debug?: boolean;
  animations?: boolean;
  lazyLoading?: boolean;
  performanceMode?: 'luxury' | 'balanced' | 'performance';
  respectReducedMotion?: boolean;
}

interface ShopifyThemeSettings {
  enable_architecture_core?: boolean;
  enable_responsive_manager?: boolean;
  enable_advanced_animations?: boolean;
  animation_speed?: 'slow' | 'normal' | 'fast';
  respect_reduced_motion?: boolean;
  debug_mode?: boolean;
}

// Main Theme Class with Dependency Injection Pattern
class RolexTheme {
  private static instance: RolexTheme;
  private config: RolexThemeConfig;
  private themeCore: ThemeCore;
  private animationController: LuxuryAnimationController;
  private responsiveManager: ResponsiveManager;
  private performanceOptimizer: PerformanceOptimizer;
  private seoEnhancer: SEOEnhancer;
  private accessibilityController: AccessibilityController;
  private initialized = false;

  private constructor(config: RolexThemeConfig = {}) {
    this.config = {
      debug: false,
      animations: true,
      lazyLoading: true,
      performanceMode: 'luxury',
      respectReducedMotion: true,
      ...config
    };

    // Initialize core components with dependency injection
    this.initializeComponents();
  }

  public static getInstance(config?: RolexThemeConfig): RolexTheme {
    if (!RolexTheme.instance) {
      RolexTheme.instance = new RolexTheme(config);
    }
    return RolexTheme.instance;
  }

  private initializeComponents(): void {
    // Core architecture
    this.themeCore = new ThemeCore(this.config);
    
    // Performance and optimization
    this.performanceOptimizer = new PerformanceOptimizer({
      lazyLoading: this.config.lazyLoading,
      performanceMode: this.config.performanceMode
    });
    
    // Responsive management
    this.responsiveManager = new ResponsiveManager();
    
    // Animation system
    this.animationController = new LuxuryAnimationController({
      enabled: this.config.animations,
      respectReducedMotion: this.config.respectReducedMotion,
      performanceOptimizer: this.performanceOptimizer
    });
    
    // SEO and accessibility
    this.seoEnhancer = new SEOEnhancer();
    this.accessibilityController = new AccessibilityController();

    if (this.config.debug) {
      console.log('🏗️ Rolex Theme Core Initialized', {
        config: this.config,
        timestamp: new Date().toISOString()
      });
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️ Rolex Theme already initialized');
      return;
    }

    try {
      // Get Shopify theme settings
      const shopifySettings = this.getShopifySettings();
      this.mergeShopifySettings(shopifySettings);

      // Initialize components in order
      await Promise.all([
        this.performanceOptimizer.initialize(),
        this.responsiveManager.initialize(),
        this.seoEnhancer.initialize(),
        this.accessibilityController.initialize()
      ]);

      // Initialize animations after other systems
      await this.animationController.initialize();

      // Initialize core theme functionality
      await this.themeCore.initialize();

      this.initialized = true;

      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('rolex:theme:ready', {
        detail: { instance: this }
      }));

      if (this.config.debug) {
        console.log('✅ Rolex Theme Fully Initialized');
        this.logPerformanceMetrics();
      }

    } catch (error) {
      console.error('❌ Rolex Theme Initialization Failed:', error);
      throw error;
    }
  }

  private getShopifySettings(): ShopifyThemeSettings {
    const settings: ShopifyThemeSettings = {};
    
    // Extract from Shopify's theme settings
    if (typeof window !== 'undefined' && (window as any).theme?.settings) {
      const themeSettings = (window as any).theme.settings;
      
      settings.enable_architecture_core = themeSettings.enable_architecture_core;
      settings.enable_responsive_manager = themeSettings.enable_responsive_manager;
      settings.enable_advanced_animations = themeSettings.enable_advanced_animations;
      settings.animation_speed = themeSettings.animation_speed;
      settings.respect_reduced_motion = themeSettings.respect_reduced_motion;
      settings.debug_mode = themeSettings.debug_mode;
    }
    
    return settings;
  }

  private mergeShopifySettings(shopifySettings: ShopifyThemeSettings): void {
    if (shopifySettings.debug_mode !== undefined) {
      this.config.debug = shopifySettings.debug_mode;
    }
    
    if (shopifySettings.enable_advanced_animations !== undefined) {
      this.config.animations = shopifySettings.enable_advanced_animations;
    }
    
    if (shopifySettings.respect_reduced_motion !== undefined) {
      this.config.respectReducedMotion = shopifySettings.respect_reduced_motion;
    }
    
    // Update animation speed
    if (shopifySettings.animation_speed) {
      this.animationController?.updateSpeed(shopifySettings.animation_speed);
    }
  }

  private logPerformanceMetrics(): void {
    if (!this.config.debug) return;

    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('📊 LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('📊 FID:', (entry as any).processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            console.log('📊 CLS:', (entry as any).value);
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not supported');
    }
  }

  // Public API methods
  public getComponent<T>(componentName: string): T | null {
    switch (componentName) {
      case 'themeCore':
        return this.themeCore as T;
      case 'animationController':
        return this.animationController as T;
      case 'responsiveManager':
        return this.responsiveManager as T;
      case 'performanceOptimizer':
        return this.performanceOptimizer as T;
      case 'seoEnhancer':
        return this.seoEnhancer as T;
      case 'accessibilityController':
        return this.accessibilityController as T;
      default:
        return null;
    }
  }

  public updateConfig(newConfig: Partial<RolexThemeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Propagate updates to components
    this.animationController?.updateConfig({
      enabled: this.config.animations,
      respectReducedMotion: this.config.respectReducedMotion
    });
  }

  public destroy(): void {
    this.themeCore?.destroy();
    this.animationController?.destroy();
    this.responsiveManager?.destroy();
    this.performanceOptimizer?.destroy();
    this.seoEnhancer?.destroy();
    this.accessibilityController?.destroy();
    
    this.initialized = false;
  }
}

// DOM Content Loaded initialization
const initializeTheme = async () => {
  try {
    const theme = RolexTheme.getInstance();
    await theme.initialize();
  } catch (error) {
    console.error('Failed to initialize Rolex Theme:', error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}

// Global exposure for Shopify sections
(window as any).RolexTheme = RolexTheme;

// Export for module usage
export { RolexTheme };
export type { RolexThemeConfig, ShopifyThemeSettings };