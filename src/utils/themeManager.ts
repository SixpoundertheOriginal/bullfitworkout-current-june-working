
import { BullFitTheme } from '@/data/themes';

export class ThemeManager {
  private static STORAGE_KEY = 'bullfit-theme';
  
  /**
   * Apply theme to the document root
   */
  static applyTheme(theme: BullFitTheme): void {
    const root = document.documentElement;
    
    try {
      // Apply color tokens as CSS custom properties
      Object.entries(theme.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS custom properties
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssKey}`, value);
      });
      
      // Apply typography tokens if provided
      if (theme.typography?.fontFamily) {
        root.style.setProperty('--font-family-base', theme.typography.fontFamily);
      }
      
      if (theme.typography?.fontWeights) {
        Object.entries(theme.typography.fontWeights).forEach(([weight, value]) => {
          root.style.setProperty(`--font-weight-${weight}`, value.toString());
        });
      }
      
      // Set theme attributes for CSS selectors
      root.setAttribute('data-theme', theme.id);
      root.setAttribute('data-theme-type', theme.type);
      
      // Apply branding if provided
      if (theme.branding) {
        this.applyBranding(theme.branding);
      }
      
      console.log(`Theme "${theme.name}" applied successfully`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
      throw new Error(`Theme application failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Apply enterprise branding
   */
  private static applyBranding(branding: NonNullable<BullFitTheme['branding']>): void {
    // Update document title if company name provided
    if (branding.companyName) {
      document.title = `${branding.companyName} Fitness`;
    }
    
    // Apply brand colors as CSS custom properties
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
    }
    
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
    
    // Apply custom CSS if provided (sanitized)
    if (branding.customCSS) {
      this.injectCustomCSS(branding.customCSS);
    }
    
    // Update favicon if provided
    if (branding.favicon) {
      this.updateFavicon(branding.favicon);
    }
  }
  
  /**
   * Safely inject custom CSS
   */
  private static injectCustomCSS(css: string): void {
    // Remove any existing custom theme CSS
    const existingStyle = document.getElementById('custom-theme-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Sanitize CSS (basic sanitization)
    const sanitizedCSS = css
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/expression\s*\(/gi, ''); // Remove CSS expressions
    
    // Create and inject new style element
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-theme-css';
    styleElement.textContent = sanitizedCSS;
    document.head.appendChild(styleElement);
  }
  
  /**
   * Update favicon
   */
  private static updateFavicon(faviconUrl: string): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = faviconUrl;
      document.head.appendChild(newFavicon);
    }
  }
  
  /**
   * Save theme to localStorage
   */
  static saveTheme(theme: BullFitTheme): void {
    try {
      const themeData = {
        id: theme.id,
        timestamp: Date.now(),
        customizations: theme.branding || {}
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(themeData));
      console.log(`Theme "${theme.name}" saved to localStorage`);
    } catch (error) {
      console.warn('Theme persistence failed, using session storage fallback');
      try {
        sessionStorage.setItem(this.STORAGE_KEY, theme.id);
      } catch (sessionError) {
        console.warn('Session storage also failed, theme will not persist');
      }
    }
  }
  
  /**
   * Load theme from localStorage
   */
  static loadSavedTheme(): { id: string; customizations?: any } | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const themeData = JSON.parse(saved);
        
        // Check if theme is not too old (30 days)
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        if (themeData.timestamp && (Date.now() - themeData.timestamp) > maxAge) {
          this.clearSavedTheme();
          return null;
        }
        
        return {
          id: themeData.id,
          customizations: themeData.customizations
        };
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
      this.clearSavedTheme();
    }
    
    // Fallback to session storage
    try {
      const sessionThemeId = sessionStorage.getItem(this.STORAGE_KEY);
      if (sessionThemeId) {
        return { id: sessionThemeId };
      }
    } catch (error) {
      console.warn('Failed to load theme from session storage:', error);
    }
    
    return null;
  }
  
  /**
   * Clear saved theme
   */
  static clearSavedTheme(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear saved theme:', error);
    }
  }
  
  /**
   * Get system theme preference
   */
  static getSystemThemePreference(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default to dark for BullFit
  }
}
