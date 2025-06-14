
import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '@/services/performanceMonitor';
import { errorTracking } from '@/services/errorTracking';
import { usePerformanceContext } from '@/contexts/PerformanceContext';

interface PerformanceMonitoringOptions {
  componentName: string;
  trackRenders?: boolean;
  trackUserInteractions?: boolean;
}

export function usePerformanceMonitoring(options: PerformanceMonitoringOptions) {
  const { componentName, trackRenders = true, trackUserInteractions = true } = options;
  const { state, dispatch } = usePerformanceContext();
  const renderStartTime = useRef<number>(0);
  const lastReportTime = useRef<number>(0);

  // Only track renders in development or when explicitly enabled
  const shouldTrackRenders = trackRenders && (process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true'));

  // Track component renders with throttling
  useEffect(() => {
    if (shouldTrackRenders) {
      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (shouldTrackRenders && renderStartTime.current > 0) {
      const renderDuration = performance.now() - renderStartTime.current;
      
      // Throttle performance reports to prevent spam
      const now = Date.now();
      if (now - lastReportTime.current > 1000) { // Max 1 report per second
        dispatch({ type: 'UPDATE_RENDER_METRICS', payload: { renderTime: renderDuration } });
        
        performanceMonitor.trackComponentRender(componentName, renderDuration, true);
        
        // Only log significant performance issues
        if (renderDuration > 50) { // Increased threshold
          console.warn(`[Performance] Slow render in ${componentName}: ${renderDuration.toFixed(1)}ms`);
          errorTracking.capturePerformanceMetric(`${componentName}_slow_render`, renderDuration);
        }
        
        lastReportTime.current = now;
      }

      renderStartTime.current = 0;
    }
  });

  const trackInteraction = useCallback((interactionType: string, startTime?: number) => {
    if (!trackUserInteractions) return;

    const endTime = performance.now();
    const duration = startTime ? endTime - startTime : 0;
    
    dispatch({ type: 'UPDATE_INTERACTION_METRICS', payload: { duration, wasSuccessful: duration <= 100 } });
    
    // Only track slow interactions
    if (duration > 100) {
      errorTracking.capturePerformanceMetric(`${componentName}_slow_interaction`, duration, {
        interactionType,
        interactionCount: state.interactionMetrics.interactionCount + 1
      });
    }
  }, [trackUserInteractions, componentName, state.interactionMetrics.interactionCount, dispatch]);

  return {
    trackInteraction,
    renderMetrics: state.renderMetrics,
  };
}
