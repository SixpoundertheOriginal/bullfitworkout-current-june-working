
// Main typography utility with stronger hierarchy and section titles
export const typography = {
  // Main text styles
  text: {
    primary: "text-white font-medium text-base",
    secondary: "text-white/80 text-base",
    muted: "text-white/60 text-sm",
  },

  // Headings (strong separation of levels)
  headings: {
    primary: "text-white font-bold text-2xl sm:text-3xl",
    section: "text-white font-semibold text-lg sm:text-xl",
    collapsible: "text-sm font-medium text-white",
  },

  // Interactive elements
  interactive: {
    button: "text-white hover:text-white/90 font-medium",
    link: "text-purple-400 hover:text-purple-300 font-medium",
  },

  // Special sections
  sections: {
    title: "text-white font-bold text-xl",
    subtitle: "text-white/80 text-lg",
    label: "text-white/70 text-xs font-medium tracking-wide",
  }
};

// Helper function to combine typography classes
export const combineTypography = (...classes: string[]) => {
  return classes.join(" ");
};
