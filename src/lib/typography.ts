
export const typography = {
  // Strengthened text styles
  text: {
    primary: "text-white font-normal text-base",
    secondary: "text-white/80 text-base",
    muted: "text-white/60 text-sm",
    small: "text-white/70 text-xs",
  },

  // Headings (clear separation & consistency)
  headings: {
    h1: "text-white font-bold text-3xl sm:text-4xl leading-tight",
    h2: "text-white font-bold text-2xl sm:text-3xl leading-snug",
    h3: "text-white font-semibold text-xl sm:text-2xl",
    h4: "text-white font-semibold text-lg",
    // Add the missing properties that are being referenced
    primary: "text-white font-bold text-2xl leading-tight",
    section: "text-white font-semibold text-lg",
    collapsible: "text-white font-medium text-base"
  },

  // Interactive elements
  interactive: {
    button: "text-white hover:text-white/90 font-medium",
    link: "text-purple-400 hover:text-purple-300 font-medium",
  },

  // Sections & labels
  sections: {
    title: "text-white font-bold text-xl",
    subtitle: "text-white/80 text-lg",
    label: "text-white/70 text-xs font-medium tracking-wide",
  }
};

export const combineTypography = (...classes: string[]) => {
  return classes.join(" ");
};
