import { typography } from './typography';

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
  
  // Updated to use typography system
  textStyles: {
    primary: typography.text.primary,
    secondary: typography.text.secondary,
    tertiary: typography.text.muted,
    data: "font-mono text-white",
    heading: typography.headings.primary,
    button: typography.interactive.button,
    sectionHeading: typography.headings.section,
    sectionSubheading: "text-lg font-medium text-purple-300"
  }
};

// Helper function to combine theme classes with custom classes
export const withTheme = (baseClasses: string, customClasses?: string) => {
  return customClasses ? `${baseClasses} ${customClasses}` : baseClasses;
};

// Updated darkModeText object to use typography system
export const darkModeText = {
  heading: typography.headings.primary,
  sectionTitle: typography.sections.title,
  subheading: typography.text.secondary,
  body: typography.text.secondary,
  muted: typography.text.muted,
  highlight: typography.interactive.link,
  label: typography.sections.label,
};

// Helper function specifically for section headings in dark mode
export const getSectionHeadingClasses = (withIcon: boolean = false) => {
  return `flex ${withIcon ? 'items-center gap-2' : ''} text-xl font-bold text-white`;
};
