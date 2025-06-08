
import { useTheme as useThemeContext } from '@/contexts/ThemeContext';
import { useCallback } from 'react';

export const useTheme = () => {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    customizeTheme,
    resetTheme,
    isLoading,
    error
  } = useThemeContext();

  // Quick theme switching helpers
  const switchToDark = useCallback(() => {
    const darkTheme = availableThemes.find(theme => theme.type === 'dark');
    if (darkTheme) {
      setTheme(darkTheme.id);
    }
  }, [availableThemes, setTheme]);

  const switchToLight = useCallback(() => {
    const lightTheme = availableThemes.find(theme => theme.type === 'light');
    if (lightTheme) {
      setTheme(lightTheme.id);
    }
  }, [availableThemes, setTheme]);

  // Enterprise branding helpers
  const applyBranding = useCallback((companyName: string, primaryColor: string, logo?: string) => {
    customizeTheme({
      branding: {
        companyName,
        primaryColor,
        logo
      }
    });
  }, [customizeTheme]);

  const clearBranding = useCallback(() => {
    customizeTheme({
      branding: undefined
    });
  }, [customizeTheme]);

  // Theme type helpers
  const isDark = currentTheme.type === 'dark';
  const isLight = currentTheme.type === 'light';
  const isCustom = currentTheme.type === 'custom';

  // Get themes by type
  const darkThemes = availableThemes.filter(theme => theme.type === 'dark');
  const lightThemes = availableThemes.filter(theme => theme.type === 'light');
  const customThemes = availableThemes.filter(theme => theme.type === 'custom');

  return {
    // Core theme state
    currentTheme,
    availableThemes,
    isLoading,
    error,
    
    // Theme actions
    setTheme,
    customizeTheme,
    resetTheme,
    
    // Quick actions
    switchToDark,
    switchToLight,
    
    // Enterprise features
    applyBranding,
    clearBranding,
    
    // Theme type info
    isDark,
    isLight,
    isCustom,
    
    // Themed collections
    darkThemes,
    lightThemes,
    customThemes,
    
    // Current theme info
    themeName: currentTheme.name,
    themeId: currentTheme.id,
    themeType: currentTheme.type,
    hasBranding: !!currentTheme.branding
  };
};

export default useTheme;
