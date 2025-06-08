
import { useEffect, useCallback } from 'react';
import { memoryManager } from '@/services/memoryManager';
import { errorTracking } from '@/services/errorTracking';
import { usePerformanceContext } from '@/contexts/PerformanceContext';

interface MemoryManagementOptions {
  componentName: string;
  trackMemory?: boolean;
  autoOptimize?: boolean;
}

export function useMemoryManagement(options: MemoryManagementOptions) {
  const { componentName, trackMemory = false, autoOptimize = true } = options;
  const { state, dispatch } = usePerformanceContext();

  // Track memory usage
  useEffect(() => {
    if (trackMemory) {
      const checkMemory = () => {
        const metrics = memoryManager.getMemoryMetrics();
        if (metrics) {
          dispatch({ 
            type: 'UPDATE_MEMORY_METRICS', 
            payload: { 
              usedJSHeapSize: metrics.usedJSHeapSize,
              memoryPressure: metrics.pressureLevel.level
            }
          });
          
          errorTracking.capturePerformanceMetric(`${componentName}_memory`, metrics.usedJSHeapSize, {
            pressureLevel: metrics.pressureLevel.level,
            usagePercentage: metrics.pressureLevel.usagePercentage
          });
        }
      };

      const interval = setInterval(checkMemory, 5000);
      return () => clearInterval(interval);
    }
  }, [trackMemory, componentName, dispatch]);

  // Auto-optimization features
  useEffect(() => {
    if (!autoOptimize) return;

    const optimizationTimer = setTimeout(() => {
      const avgRenderTime = state.renderMetrics.averageRenderTime;

      if (avgRenderTime > 50) {
        console.warn(`[Performance] Component ${componentName} averaging ${avgRenderTime}ms renders. Consider optimization.`);
        errorTracking.captureError(new Error(`Slow component performance: ${componentName}`), {
          component: componentName,
          userAction: 'performance_analysis'
        });
      }

      if (trackMemory) {
        const metrics = memoryManager.getMemoryMetrics();
        if (metrics?.pressureLevel.level === 'high') {
          console.log(`[Performance] High memory pressure detected in ${componentName}. Triggering cleanup.`);
          window.dispatchEvent(new CustomEvent('performance-optimization-requested', {
            detail: { component: componentName, reason: 'high_memory_pressure' }
          }));
        }
      }
    }, 10000);

    return () => clearTimeout(optimizationTimer);
  }, [autoOptimize, componentName, trackMemory, state.renderMetrics.averageRenderTime]);

  // Memory pressure callback
  useEffect(() => {
    if (trackMemory) {
      const unsubscribe = memoryManager.onMemoryPressure((level) => {
        if (level.level === 'high' || level.level === 'critical') {
          console.log(`[Performance] Memory pressure in ${componentName}: ${level.level}`);
          errorTracking.capturePerformanceMetric(`${componentName}_memory_pressure`, level.usagePercentage, {
            level: level.level,
            recommendedAction: level.recommendedAction
          });
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [trackMemory, componentName]);

  const getMemoryMetrics = useCallback(() => {
    return state.memoryMetrics;
  }, [state.memoryMetrics]);

  return {
    memoryMetrics: state.memoryMetrics,
    getMemoryMetrics,
  };
}
