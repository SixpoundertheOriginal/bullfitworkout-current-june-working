
import { useCallback } from 'react';
import { errorTracking } from '@/services/errorTracking';

interface ErrorTrackingOptions {
  componentName: string;
}

export function useErrorTracking(options: ErrorTrackingOptions) {
  const { componentName } = options;

  const captureError = useCallback((error: Error, context?: Record<string, any>) => {
    errorTracking.captureError(error, {
      component: componentName,
      userAction: context?.userAction || 'unknown',
      ...context
    });
  }, [componentName]);

  const capturePerformanceMetric = useCallback((name: string, value: number, context?: Record<string, any>) => {
    errorTracking.capturePerformanceMetric(`${componentName}_${name}`, value, context);
  }, [componentName]);

  const trackUserFlow = useCallback((stepName: string, success: boolean = true, metadata?: Record<string, any>) => {
    errorTracking.trackUserFlow(componentName, stepName, success, metadata);
  }, [componentName]);

  const benchmark = useCallback(async <T>(
    operation: () => Promise<T> | T,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      capturePerformanceMetric(operationName, duration);
      
      if (duration > 100) {
        console.warn(`[Performance] Slow operation ${operationName} in ${componentName}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      captureError(error as Error, {
        userAction: operationName
      });
      throw error;
    }
  }, [componentName, capturePerformanceMetric, captureError]);

  return {
    captureError,
    capturePerformanceMetric,
    trackUserFlow,
    benchmark,
  };
}
