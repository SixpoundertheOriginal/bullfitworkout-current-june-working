
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BullFitTheme, BUILTIN_THEMES, DEFAULT_THEME } from '@/data/themes';
import { ThemeManager } from '@/utils/themeManager';

interface ThemeContextType {
  currentTheme: BullFitTheme;
  availableThemes: BullFitTheme[];
  setTheme: (themeId: string) => void;
  customizeTheme: (customizations: Partial<BullFitTheme>) => void;
  resetTheme: () => void;
  isLoading: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<BullFitTheme>(DEFAULT_THEME);
  const [availableThemes] = useState<BullFitTheme[]>(BUILTIN_THEMES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load saved theme
        const savedTheme = ThemeManager.loadSavedTheme();
        
        if (savedTheme) {
          const theme = availableThemes.find(t => t.id === savedTheme.id);
          if (theme) {
            // Apply any saved customizations
            const customizedTheme = savedTheme.customizations 
              ? { ...theme, branding: { ...theme.branding, ...savedTheme.customizations } }
              : theme;
            
            setCurrentTheme(customizedTheme);
            ThemeManager.applyTheme(customizedTheme);
            console.log(`Restored theme: ${theme.name}`);
          } else {
            console.warn(`Saved theme "${savedTheme.id}" not found, using default`);
            ThemeManager.applyTheme(DEFAULT_THEME);
          }
        } else {
          // No saved theme, use default
          ThemeManager.applyTheme(DEFAULT_THEME);
          console.log('No saved theme found, using default theme');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize theme';
        console.error('Theme initialization error:', errorMessage);
        setError(errorMessage);
        
        // Fallback to default theme
        setCurrentTheme(DEFAULT_THEME);
        ThemeManager.applyTheme(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [availableThemes]);

  const setTheme = useCallback((themeId: string) => {
    try {
      setError(null);
      
      const theme = availableThemes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme "${themeId}" not found`);
      }

      setCurrentTheme(theme);
      ThemeManager.applyTheme(theme);
      ThemeManager.saveTheme(theme);
      
      console.log(`Theme switched to: ${theme.name}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set theme';
      console.error('Theme setting error:', errorMessage);
      setError(errorMessage);
    }
  }, [availableThemes]);

  const customizeTheme = useCallback((customizations: Partial<BullFitTheme>) => {
    try {
      setError(null);
      
      const customizedTheme: BullFitTheme = {
        ...currentTheme,
        ...customizations,
        colors: {
          ...currentTheme.colors,
          ...(customizations.colors || {})
        },
        branding: {
          ...currentTheme.branding,
          ...(customizations.branding || {})
        },
        typography: {
          ...currentTheme.typography,
          ...(customizations.typography || {})
        }
      };

      setCurrentTheme(customizedTheme);
      ThemeManager.applyTheme(customizedTheme);
      ThemeManager.saveTheme(customizedTheme);
      
      console.log('Theme customized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to customize theme';
      console.error('Theme customization error:', errorMessage);
      setError(errorMessage);
    }
  }, [currentTheme]);

  const resetTheme = useCallback(() => {
    try {
      setError(null);
      
      ThemeManager.clearSavedTheme();
      setCurrentTheme(DEFAULT_THEME);
      ThemeManager.applyTheme(DEFAULT_THEME);
      
      console.log('Theme reset to default');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset theme';
      console.error('Theme reset error:', errorMessage);
      setError(errorMessage);
    }
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    availableThemes,
    setTheme,
    customizeTheme,
    resetTheme,
    isLoading,
    error
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
