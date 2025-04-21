
/**
 * Theme constants for consistent styling across the application
 */

export const theme = {
  colors: {
    // Text colors
    text: {
      light: "text-white",
      lightMuted: "text-white/80",
      lightSubtle: "text-white/60",
    },
    // Background colors
    background: {
      dark: "bg-gray-900",
      darkGradient: "bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95",
    },
    // Accent colors
    accent: {
      purple: "text-purple-400",
      green: "text-emerald-400",
      red: "text-red-400",
    }
  },
  
  // Compound classes for common patterns
  textStyles: {
    primary: "text-white font-medium",
    secondary: "text-white/80",
    tertiary: "text-white/60",
    data: "font-mono text-white",
    heading: "text-white font-semibold",
    button: "text-white font-medium"
  }
};

// Helper function to combine theme classes with custom classes
export const withTheme = (baseClasses: string, customClasses?: string) => {
  return customClasses ? `${baseClasses} ${customClasses}` : baseClasses;
};
