
import { useCallback } from 'react';
import { errorTracking } from '@/services/errorTracking';
import { usePerformanceContext } from '@/contexts/PerformanceContext';

interface AnalyticsOptions {
  componentName: string;
}

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage?: number;
  memoryPressure?: string;
  interactionCount: number;
  slowInteractions: number;
}

export function useAnalytics(options: AnalyticsOptions) {
  const { componentName } = options;
  const { state } = usePerformanceContext();

  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      renderCount: state.renderMetrics.renderCount,
      averageRenderTime: state.renderMetrics.averageRenderTime,
      memoryUsage: state.memoryMetrics.usedJSHeapSize,
      memoryPressure: state.memoryMetrics.memoryPressure,
      interactionCount: state.interactionMetrics.interactionCount,
      slowInteractions: state.interactionMetrics.slowInteractions
    };
  }, [state]);

  const trackBusinessEvent = useCallback((eventName: string, metadata?: Record<string, any>) => {
    errorTracking.trackUserFlow(componentName, eventName, true, {
      timestamp: Date.now(),
      ...metadata
    });
  }, [componentName]);

  const trackPerformanceBottleneck = useCallback((bottleneckType: string, severity: 'low' | 'medium' | 'high') => {
    const metrics = getMetrics();
    
    errorTracking.capturePerformanceMetric(`${componentName}_bottleneck_${bottleneckType}`, 
      severity === 'high' ? 3 : severity === 'medium' ? 2 : 1, {
      severity,
      currentMetrics: metrics
    });
  }, [componentName, getMetrics]);

  const generateAnalyticsReport = useCallback(() => {
    const metrics = getMetrics();
    const report = {
      component: componentName,
      timestamp: Date.now(),
      performance: {
        renderEfficiency: metrics.renderCount > 0 ? 
          ((metrics.renderCount - metrics.slowInteractions) / metrics.renderCount * 100).toFixed(1) + '%' : 'N/A',
        averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
        interactionSuccess: metrics.interactionCount > 0 ? 
          ((metrics.interactionCount - metrics.slowInteractions) / metrics.interactionCount * 100).toFixed(1) + '%' : 'N/A',
        memoryStatus: metrics.memoryPressure || 'unknown'
      },
      usage: {
        totalRenders: metrics.renderCount,
        totalInteractions: metrics.interactionCount,
        slowOperations: metrics.slowInteractions
      }
    };

    console.log(`[Analytics] Performance Report for ${componentName}:`, report);
    return report;
  }, [componentName, getMetrics]);

  return {
    getMetrics,
    trackBusinessEvent,
    trackPerformanceBottleneck,
    generateAnalyticsReport,
  };
}
