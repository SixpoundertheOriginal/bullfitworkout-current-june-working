
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[];
}

export interface ComponentVariant {
  name: string;
  description: string;
  example: string;
}

export interface ComponentExample {
  name: string;
  description: string;
  code: string;
}

export interface AccessibilityInfo {
  keyboardSupport: boolean;
  screenReaderSupport: boolean;
  ariaSupport: boolean;
  contrastCompliant?: boolean;
  touchTargetSize?: boolean;
}

export interface PerformanceInfo {
  renderTime: number; // milliseconds
  bundleSize: number; // KB
  memoryUsage?: number; // MB
}

export interface ComponentDoc {
  name: string;
  description: string;
  category: 'navigation' | 'layout' | 'forms' | 'data' | 'feedback' | 'charts';
  usage: {
    basic: string;
    advanced: string[];
    examples: ComponentExample[];
  };
  props: ComponentProp[];
  variants: ComponentVariant[];
  defaultProps?: Record<string, any>;
  accessibility: AccessibilityInfo;
  performance: PerformanceInfo;
  themes: string[];
}
