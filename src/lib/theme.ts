
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
      // Adding high-contrast variations
      highContrast: "text-white font-medium",
      highContrastMuted: "text-purple-200",
      accent: "text-purple-400",
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
    button: "text-white font-medium",
    // Adding section heading styles for dark backgrounds
    sectionHeading: "text-xl font-bold text-white",
    sectionSubheading: "text-lg font-medium text-purple-300"
  }
};

// Helper function to combine theme classes with custom classes
export const withTheme = (baseClasses: string, customClasses?: string) => {
  return customClasses ? `${baseClasses} ${customClasses}` : baseClasses;
};

// Adding a new helper specifically for text on dark backgrounds
export const darkModeText = {
  // For main headings
  heading: "text-white font-bold",
  // For section titles
  sectionTitle: "text-purple-300 font-semibold",
  // For subheadings
  subheading: "text-white/90 font-medium",
  // For regular text
  body: "text-white/80",
  // For less important text
  muted: "text-white/60",
  // For important numbers or highlights
  highlight: "text-purple-400 font-medium",
  // For labels
  label: "text-white/70 text-sm",
};

// Helper function specifically for section headings in dark mode
export const getSectionHeadingClasses = (withIcon: boolean = false) => {
  return `flex ${withIcon ? 'items-center gap-2' : ''} text-xl font-bold text-white`;
};

