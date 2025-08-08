// =============================================================================
// SEO ENHANCER - Search Engine Optimization Utilities
// =============================================================================

export class SEOEnhancer {
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.enhanceStructuredData();
      this.optimizeMetaTags();
      this.improveAccessibility();
      
      this.initialized = true;
      console.log('🔍 SEO Enhancer initialized');
    } catch (error) {
      console.error('SEO Enhancer initialization failed:', error);
      throw error;
    }
  }

  private enhanceStructuredData(): void {
    // Add JSON-LD structured data for luxury watches
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Luxury Watch Collection",
      "description": "Premium Swiss-made timepieces",
      "url": window.location.origin
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  private optimizeMetaTags(): void {
    // Ensure proper meta tags are present
    this.ensureMetaTag('viewport', 'width=device-width, initial-scale=1');
    this.ensureMetaTag('theme-color', '#A37E2C'); // Rolex gold
  }

  private ensureMetaTag(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  }

  private improveAccessibility(): void {
    // Add skip links if not present
    if (!document.querySelector('.rolex-skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.className = 'rolex-skip-link';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      document.body.prepend(skipLink);
    }
  }

  public destroy(): void {
    this.initialized = false;
  }
}