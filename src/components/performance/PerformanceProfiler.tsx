
import React, { Profiler } from 'react';
import { errorTracking } from '@/services/errorTracking';
import { performanceMonitor } from '@/services/performanceMonitor';

interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
  threshold?: number; // ms threshold for slow renders
  onSlowRender?: (id: string, phase: string, actualDuration: number) => void;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  id,
  children,
  threshold = 16.67, // 60fps threshold
  onSlowRender
}) => {
  const onRenderCallback = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // Track all renders for analytics
    errorTracking.capturePerformanceMetric(`profiler_${id}_${phase}`, actualDuration, {
      baseDuration,
      startTime,
      commitTime,
      phase
    });

    // Track with performance monitor
    performanceMonitor.trackComponentRender(id, actualDuration, actualDuration <= threshold);

    // Alert on slow renders
    if (actualDuration > threshold) {
      console.warn(`[PerformanceProfiler] Slow ${phase} in ${id}: ${actualDuration}ms`);
      
      onSlowRender?.(id, phase, actualDuration);
      
      // Track slow render as error for monitoring
      errorTracking.captureError(new Error(`Slow render detected`), {
        component: id,
        userAction: `${phase}_render`,
      });
    }

    // Track very slow renders as critical
    if (actualDuration > 100) {
      errorTracking.captureError(new Error(`Critical slow render detected`), {
        component: id,
        userAction: `critical_${phase}_render`,
      });
    }
  };

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

// HOC for automatic performance profiling - Fixed typing
export function withPerformanceProfiler<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  profileId?: string,
  threshold?: number
) {
  const WrappedComponent = (props: P) => {
    const id = profileId || Component.displayName || Component.name || 'UnknownComponent';
    
    return (
      <PerformanceProfiler id={id} threshold={threshold}>
        <Component {...props} />
      </PerformanceProfiler>
    );
  };

  WrappedComponent.displayName = `withPerformanceProfiler(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
