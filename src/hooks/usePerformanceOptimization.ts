
import { useEffect } from 'react';
import { performanceMonitor } from '@/services/performanceMonitor';
import { useMemoryPressure } from './useMemoryPressure';

interface UsePerformanceOptimizationOptions {
  enableMemoryMonitoring?: boolean;
  enablePerformanceTracking?: boolean;
  componentName?: string;
}

export function usePerformanceOptimization({
  enableMemoryMonitoring = false,
  enablePerformanceTracking = false,
  componentName = 'UnknownComponent'
}: UsePerformanceOptimizationOptions) {
  const { memoryPressure, isHighMemoryUsage } = useMemoryPressure();

  useEffect(() => {
    if (enablePerformanceTracking) {
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        performanceMonitor.trackComponentRender(componentName, duration, true);
      };
    }
  }, [enablePerformanceTracking, componentName]);

  useEffect(() => {
    if (enableMemoryMonitoring) {
      const interval = setInterval(() => {
        performanceMonitor.measureMemoryUsage();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [enableMemoryMonitoring]);

  return {
    memoryPressure,
    isHighMemoryUsage,
    performanceMetrics: performanceMonitor.getMetrics()
  };
}
