
import { usePerformanceMonitoring } from './performance/usePerformanceMonitoring';
import { useMemoryManagement } from './performance/useMemoryManagement';
import { useErrorTracking } from './performance/useErrorTracking';
import { useAnalytics } from './performance/useAnalytics';

interface PerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMemory?: boolean;
  trackUserInteractions?: boolean;
  autoOptimize?: boolean;
}

export function useEnterprisePerformance(options: PerformanceOptions) {
  const { componentName, trackRenders, trackMemory, trackUserInteractions, autoOptimize } = options;

  const { trackInteraction, renderMetrics } = usePerformanceMonitoring({
    componentName,
    trackRenders,
    trackUserInteractions,
  });

  const { memoryMetrics, getMemoryMetrics } = useMemoryManagement({
    componentName,
    trackMemory,
    autoOptimize,
  });

  const { captureError, capturePerformanceMetric, trackUserFlow, benchmark } = useErrorTracking({
    componentName,
  });

  const { getMetrics, trackBusinessEvent, trackPerformanceBottleneck, generateAnalyticsReport } = useAnalytics({
    componentName,
  });

  return {
    // Performance monitoring
    trackInteraction,
    renderCount: renderMetrics.renderCount,
    averageRenderTime: renderMetrics.averageRenderTime,
    
    // Memory management
    memoryMetrics,
    getMemoryMetrics,
    
    // Error tracking
    captureError,
    capturePerformanceMetric,
    trackUserFlow,
    benchmark,
    
    // Analytics
    getMetrics,
    trackBusinessEvent,
    trackPerformanceBottleneck,
    generateAnalyticsReport,
  };
}
