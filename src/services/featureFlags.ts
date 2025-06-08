
interface FeatureFlags {
  virtualizedExerciseLists: boolean;
  enhancedSearch: boolean;
  offlineMode: boolean;
  performanceMonitoring: boolean;
  advancedAnalytics: boolean;
  memoryOptimization: boolean;
  enterpriseErrorTracking: boolean;
  backgroundSync: boolean;
  imageOptimization: boolean;
  bundleSplitting: boolean;
}

interface FeatureFlagConfig {
  name: keyof FeatureFlags;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: {
    userAgent?: string[];
    path?: string[];
    userType?: string[];
  };
}

class FeatureFlagService {
  private flags: FeatureFlags;
  private config: FeatureFlagConfig[] = [];
  private userId: string | null = null;
  private userGroup: string | null = null;

  constructor() {
    this.flags = this.getDefaultFlags();
    this.loadConfig();
    this.evaluateFlags();
  }

  private getDefaultFlags(): FeatureFlags {
    return {
      virtualizedExerciseLists: true,
      enhancedSearch: true,
      offlineMode: false,
      performanceMonitoring: true,
      advancedAnalytics: false,
      memoryOptimization: true,
      enterpriseErrorTracking: true,
      backgroundSync: false,
      imageOptimization: true,
      bundleSplitting: true
    };
  }

  private loadConfig() {
    // In production, this would load from your feature flag service
    this.config = [
      {
        name: 'virtualizedExerciseLists',
        enabled: true,
        rolloutPercentage: 100
      },
      {
        name: 'enhancedSearch',
        enabled: true,
        rolloutPercentage: 100
      },
      {
        name: 'offlineMode',
        enabled: false,
        rolloutPercentage: 10,
        conditions: {
          userType: ['beta', 'premium']
        }
      },
      {
        name: 'performanceMonitoring',
        enabled: true,
        rolloutPercentage: 100
      },
      {
        name: 'advancedAnalytics',
        enabled: false,
        rolloutPercentage: 25,
        conditions: {
          userType: ['premium']
        }
      },
      {
        name: 'memoryOptimization',
        enabled: true,
        rolloutPercentage: 100,
        conditions: {
          userAgent: ['Mobile', 'iPhone', 'Android']
        }
      },
      {
        name: 'enterpriseErrorTracking',
        enabled: true,
        rolloutPercentage: 100
      },
      {
        name: 'backgroundSync',
        enabled: false,
        rolloutPercentage: 5
      },
      {
        name: 'imageOptimization',
        enabled: true,
        rolloutPercentage: 90
      },
      {
        name: 'bundleSplitting',
        enabled: true,
        rolloutPercentage: 100
      }
    ];
  }

  public setUser(userId: string, userGroup?: string) {
    this.userId = userId;
    this.userGroup = userGroup;
    this.evaluateFlags();
  }

  private evaluateFlags() {
    this.config.forEach(flagConfig => {
      const isEnabled = this.evaluateFlag(flagConfig);
      this.flags[flagConfig.name] = isEnabled;
    });

    console.log('[FeatureFlags] Evaluated flags:', this.flags);
  }

  private evaluateFlag(config: FeatureFlagConfig): boolean {
    // Check if flag is globally disabled
    if (!config.enabled) {
      return false;
    }

    // Check conditions
    if (config.conditions) {
      // Check user agent conditions
      if (config.conditions.userAgent) {
        const userAgent = navigator.userAgent;
        const matches = config.conditions.userAgent.some(condition => 
          userAgent.includes(condition)
        );
        if (!matches) return false;
      }

      // Check path conditions
      if (config.conditions.path) {
        const currentPath = window.location.pathname;
        const matches = config.conditions.path.some(path => 
          currentPath.includes(path)
        );
        if (!matches) return false;
      }

      // Check user type conditions
      if (config.conditions.userType && this.userGroup) {
        const matches = config.conditions.userType.includes(this.userGroup);
        if (!matches) return false;
      }
    }

    // Check rollout percentage
    if (config.rolloutPercentage < 100) {
      const hash = this.hashUserId(this.userId || 'anonymous');
      const bucket = hash % 100;
      return bucket < config.rolloutPercentage;
    }

    return true;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  public isEnabled(flagName: keyof FeatureFlags): boolean {
    return this.flags[flagName];
  }

  public getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  public override(flagName: keyof FeatureFlags, value: boolean) {
    console.log(`[FeatureFlags] Override: ${flagName} = ${value}`);
    this.flags[flagName] = value;
    
    // Store override in localStorage for development
    const overrides = JSON.parse(localStorage.getItem('featureFlagOverrides') || '{}');
    overrides[flagName] = value;
    localStorage.setItem('featureFlagOverrides', JSON.stringify(overrides));
  }

  public clearOverrides() {
    localStorage.removeItem('featureFlagOverrides');
    this.evaluateFlags();
  }

  public loadOverrides() {
    try {
      const overrides = JSON.parse(localStorage.getItem('featureFlagOverrides') || '{}');
      Object.entries(overrides).forEach(([key, value]) => {
        if (key in this.flags) {
          this.flags[key as keyof FeatureFlags] = value as boolean;
        }
      });
    } catch (error) {
      console.warn('Failed to load feature flag overrides:', error);
    }
  }

  public async refresh() {
    // In production, this would refetch from your feature flag service
    this.loadConfig();
    this.evaluateFlags();
  }

  public onFlagChange(callback: (flags: FeatureFlags) => void) {
    // In production, this would set up real-time flag updates
    const handler = () => callback(this.getFlags());
    window.addEventListener('feature-flags-updated', handler);
    
    return () => window.removeEventListener('feature-flags-updated', handler);
  }
}

export const featureFlags = new FeatureFlagService();

// React hook for feature flags
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const [isEnabled, setIsEnabled] = React.useState(featureFlags.isEnabled(flagName));

  React.useEffect(() => {
    const unsubscribe = featureFlags.onFlagChange((flags) => {
      setIsEnabled(flags[flagName]);
    });

    return unsubscribe;
  }, [flagName]);

  return isEnabled;
}

// React hook for multiple feature flags
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = React.useState(featureFlags.getFlags());

  React.useEffect(() => {
    const unsubscribe = featureFlags.onFlagChange(setFlags);
    return unsubscribe;
  }, []);

  return flags;
}

// Global feature flags instance
if (typeof window !== 'undefined') {
  (window as any).__FEATURE_FLAGS__ = featureFlags;
  
  // Load any development overrides
  featureFlags.loadOverrides();
}

// Import React for hooks
import React from 'react';
