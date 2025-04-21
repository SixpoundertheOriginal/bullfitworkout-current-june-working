
export const typography = {
  // Main text styles
  text: {
    primary: "text-white font-medium",
    secondary: "text-white/80",
    muted: "text-white/60",
  },
  
  // Heading styles
  headings: {
    primary: "text-white font-bold",
    section: "text-white font-semibold",
    collapsible: "text-sm font-medium text-white",
  },
  
  // Interactive elements
  interactive: {
    button: "text-white hover:text-white/90",
    link: "text-purple-400 hover:text-purple-300",
  },
  
  // Special sections
  sections: {
    title: "text-white font-bold",
    subtitle: "text-white/80",
    label: "text-white/70",
  }
};

// Helper function to combine typography classes
export const combineTypography = (...classes: string[]) => {
  return classes.join(" ");
};
