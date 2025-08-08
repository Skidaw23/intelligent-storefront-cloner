// Constants for Royal Equips theme
window.theme = window.theme || {};

// Theme constants
window.theme.constants = {
  // Breakpoints (matching CSS)
  BREAKPOINTS: {
    small: 749,
    medium: 990,
    large: 1200
  },
  
  // Animation timings
  ANIMATION: {
    fast: 150,
    base: 300,
    slow: 500,
    smooth: 600
  },
  
  // Z-index scale
  Z_INDEX: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  },
  
  // Royal Equips brand colors
  COLORS: {
    royalDark: '#0a0a0a',
    royalCharcoal: '#1a1a1a',
    royalSilver: '#c0c0c0',
    royalBlue: '#00bfff',
    royalBlueDark: '#0080cc',
    royalAccent: '#ff6b35',
    royalGold: '#d4af37'
  },
  
  // Performance settings
  PERFORMANCE: {
    debounceDelay: 250,
    throttleDelay: 16,
    intersectionThreshold: 0.1,
    lazyLoadMargin: '50px'
  }
};

// Shopify routes and configuration
window.routes = window.routes || {};
window.cartStrings = window.cartStrings || {};
window.variantStrings = window.variantStrings || {};
window.accessibilityStrings = window.accessibilityStrings || {};