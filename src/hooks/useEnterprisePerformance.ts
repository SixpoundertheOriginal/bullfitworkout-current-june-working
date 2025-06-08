import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '@/services/performanceMonitor';
import { errorTracking } from '@/services/errorTracking';
import { memoryManager } from '@/services/memoryManager';

interface PerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMemory?: boolean;
  trackUserInteractions?: boolean;
  autoOptimize?: boolean;
}

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage?: number;
  memoryPressure?: string;
  interactionCount: number;
  slowInteractions: number;
}

export function useEnterprisePerformance(options: PerformanceOptions) {
  const {
    componentName,
    trackRenders = true,
    trackMemory = false,
    trackUserInteractions = true,
    autoOptimize = true
  } = options;

  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const interactionCount = useRef<number>(0);
  const slowInteractions = useRef<number>(0);
  const lastMemoryCheck = useRef<number>(0);

  // Track component renders
  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (trackRenders && renderStartTime.current > 0) {
      const renderDuration = performance.now() - renderStartTime.current;
      renderCount.current++;
      renderTimes.current.push(renderDuration);
      
      // Keep only last 20 render times for memory efficiency
      if (renderTimes.current.length > 20) {
        renderTimes.current = renderTimes.current.slice(-20);
      }

      // Track performance metrics
      performanceMonitor.trackComponentRender(componentName, renderDuration, true);
      errorTracking.capturePerformanceMetric(`${componentName}_render`, renderDuration, {
        renderCount: renderCount.current
      });

      // Alert on slow renders
      if (renderDuration > 16.67) { // 60fps threshold
        console.warn(`[Performance] Slow render in ${componentName}: ${renderDuration}ms`);
        errorTracking.capturePerformanceMetric(`${componentName}_slow_render`, renderDuration);
      }

      renderStartTime.current = 0;
    }
  });

  // Track memory usage
  useEffect(() => {
    if (trackMemory) {
      const checkMemory = () => {
        const metrics = memoryManager.getMemoryMetrics();
        if (metrics) {
          errorTracking.capturePerformanceMetric(`${componentName}_memory`, metrics.usedJSHeapSize, {
            pressureLevel: metrics.pressureLevel.level,
            usagePercentage: metrics.pressureLevel.usagePercentage
          });
        }
      };

      const interval = setInterval(checkMemory, 5000);
      return () => clearInterval(interval);
    }
  }, [trackMemory, componentName]);

  // Track user interactions
  const trackInteraction = useCallback((interactionType: string, startTime?: number) => {
    if (!trackUserInteractions) return;

    const endTime = performance.now();
    const duration = startTime ? endTime - startTime : 0;
    
    interactionCount.current++;
    
    if (duration > 100) { // Interactions should complete within 100ms
      slowInteractions.current++;
      errorTracking.capturePerformanceMetric(`${componentName}_slow_interaction`, duration, {
        interactionType,
        interactionCount: interactionCount.current
      });
    }

    errorTracking.trackUserFlow(componentName, interactionType, duration <= 100, {
      duration,
      interactionCount: interactionCount.current
    });
  }, [trackUserInteractions, componentName]);

  // Auto-optimization features
  useEffect(() => {
    if (!autoOptimize) return;

    const optimizationTimer = setTimeout(() => {
      const avgRenderTime = renderTimes.current.length > 0 
        ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
        : 0;

      // Suggest optimizations for slow components
      if (avgRenderTime > 50) {
        console.warn(`[Performance] Component ${componentName} averaging ${avgRenderTime}ms renders. Consider optimization.`);
        errorTracking.captureError(new Error(`Slow component performance: ${componentName}`), {
          component: componentName,
          userAction: 'performance_analysis'
        });
      }

      // Memory pressure optimization
      if (trackMemory) {
        const metrics = memoryManager.getMemoryMetrics();
        if (metrics?.pressureLevel.level === 'high') {
          console.log(`[Performance] High memory pressure detected in ${componentName}. Triggering cleanup.`);
          // Component could implement cleanup in response to this
          window.dispatchEvent(new CustomEvent('performance-optimization-requested', {
            detail: { component: componentName, reason: 'high_memory_pressure' }
          }));
        }
      }
    }, 10000); // Check after 10 seconds

    return () => clearTimeout(optimizationTimer);
  }, [autoOptimize, componentName, trackMemory]);

  // Memory pressure callback
  useEffect(() => {
    if (trackMemory) {
      return memoryManager.onMemoryPressure((level) => {
        if (level.level === 'high' || level.level === 'critical') {
          console.log(`[Performance] Memory pressure in ${componentName}: ${level.level}`);
          errorTracking.capturePerformanceMetric(`${componentName}_memory_pressure`, level.usagePercentage, {
            level: level.level,
            recommendedAction: level.recommendedAction
          });
        }
      });
    }
  }, [trackMemory, componentName]);

  // Get current performance metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const avgRenderTime = renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0;

    const memoryMetrics = trackMemory ? memoryManager.getMemoryMetrics() : null;

    return {
      renderCount: renderCount.current,
      averageRenderTime: avgRenderTime,
      memoryUsage: memoryMetrics?.usedJSHeapSize,
      memoryPressure: memoryMetrics?.pressureLevel.level,
      interactionCount: interactionCount.current,
      slowInteractions: slowInteractions.current
    };
  }, [trackMemory]);

  // Benchmark a specific operation
  const benchmark = useCallback(async <T>(
    operation: () => Promise<T> | T,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      errorTracking.capturePerformanceMetric(`${componentName}_${operationName}`, duration);
      
      if (duration > 100) {
        console.warn(`[Performance] Slow operation ${operationName} in ${componentName}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      errorTracking.captureError(error as Error, {
        component: componentName,
        userAction: operationName
      });
      throw error;
    }
  }, [componentName]);

  return {
    trackInteraction,
    getMetrics,
    benchmark,
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0
  };
}
