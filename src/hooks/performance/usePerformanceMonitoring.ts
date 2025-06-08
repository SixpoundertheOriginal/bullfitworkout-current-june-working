
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

  // Track component renders
  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (trackRenders && renderStartTime.current > 0) {
      const renderDuration = performance.now() - renderStartTime.current;
      
      dispatch({ type: 'UPDATE_RENDER_METRICS', payload: { renderTime: renderDuration } });
      
      performanceMonitor.trackComponentRender(componentName, renderDuration, true);
      errorTracking.capturePerformanceMetric(`${componentName}_render`, renderDuration, {
        renderCount: state.renderMetrics.renderCount + 1
      });

      if (renderDuration > 16.67) {
        console.warn(`[Performance] Slow render in ${componentName}: ${renderDuration}ms`);
        errorTracking.capturePerformanceMetric(`${componentName}_slow_render`, renderDuration);
      }

      renderStartTime.current = 0;
    }
  });

  const trackInteraction = useCallback((interactionType: string, startTime?: number) => {
    if (!trackUserInteractions) return;

    const endTime = performance.now();
    const duration = startTime ? endTime - startTime : 0;
    
    dispatch({ type: 'UPDATE_INTERACTION_METRICS', payload: { duration, wasSuccessful: duration <= 100 } });
    
    if (duration > 100) {
      errorTracking.capturePerformanceMetric(`${componentName}_slow_interaction`, duration, {
        interactionType,
        interactionCount: state.interactionMetrics.interactionCount + 1
      });
    }

    errorTracking.trackUserFlow(componentName, interactionType, duration <= 100, {
      duration,
      interactionCount: state.interactionMetrics.interactionCount + 1
    });
  }, [trackUserInteractions, componentName, state.interactionMetrics.interactionCount, dispatch]);

  return {
    trackInteraction,
    renderMetrics: state.renderMetrics,
  };
}
