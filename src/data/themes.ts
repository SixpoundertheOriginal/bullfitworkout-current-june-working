
export interface BullFitTheme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
  };
  branding?: {
    logo?: string;
    companyName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
    customCSS?: string;
  };
  typography?: {
    fontFamily?: string;
    fontWeights?: Record<string, number>;
  };
}

export const BUILTIN_THEMES: BullFitTheme[] = [
  {
    id: 'default',
    name: 'BullFit Default',
    type: 'dark',
    colors: {
      primary: '253 87% 76%', // #9b87f5
      secondary: '31 96% 60%', // #F97316
      accent: '92 76% 91%', // #F2FCE2
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 98%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 98%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '240 5% 64.9%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '240 4.9% 83.9%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
    }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    type: 'light',
    colors: {
      primary: '220 100% 50%', // #0066ff
      secondary: '210 100% 60%', // #3388ff
      accent: '200 100% 70%', // #66aaff
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '220 100% 50%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    },
    branding: {
      companyName: 'Corporate Fitness',
      primaryColor: '#0066ff'
    }
  },
  {
    id: 'fitness-red',
    name: 'Fitness Red',
    type: 'dark',
    colors: {
      primary: '0 84% 60%', // #ef4444
      secondary: '15 90% 55%', // #f97316
      accent: '45 96% 65%', // #fbbf24
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 98%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 98%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '240 5% 64.9%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '0 84% 60%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
    }
  },
  {
    id: 'enterprise-dark',
    name: 'Enterprise Dark',
    type: 'dark',
    colors: {
      primary: '210 40% 50%', // Professional blue-gray
      secondary: '220 30% 60%',
      accent: '200 50% 70%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '210 40% 50%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
    },
    branding: {
      companyName: 'Enterprise Solutions'
    }
  }
];

export const DEFAULT_THEME = BUILTIN_THEMES[0];
