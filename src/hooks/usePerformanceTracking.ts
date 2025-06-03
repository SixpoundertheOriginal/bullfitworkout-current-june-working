
import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/services/performanceMonitor';

interface UsePerformanceTrackingOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMemory?: boolean;
}

export function usePerformanceTracking({ 
  componentName, 
  trackRenders = true, 
  trackMemory = false 
}: UsePerformanceTrackingOptions) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (trackRenders && renderStartTime.current > 0) {
      const renderDuration = performance.now() - renderStartTime.current;
      renderCount.current++;
      
      // Determine if render was necessary (simplified - assume first render is necessary)
      const wasNecessary = renderCount.current === 1;
      
      performanceMonitor.trackComponentRender(componentName, renderDuration, wasNecessary);
      renderStartTime.current = 0;
    }

    if (trackMemory && renderCount.current % 10 === 0) {
      // Measure memory every 10 renders to avoid performance impact
      performanceMonitor.measureMemoryUsage();
    }
  });

  return {
    renderCount: renderCount.current
  };
}
