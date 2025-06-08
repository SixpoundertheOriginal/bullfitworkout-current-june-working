
interface PerformanceThresholds {
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  frameRate: number;
}

interface PerformanceReport {
  componentName: string;
  timestamp: number;
  metrics: {
    renderCount: number;
    averageRenderTime: number;
    memoryUsage?: number;
    interactionCount: number;
    slowOperations: number;
  };
  recommendations: string[];
}

class PerformanceService {
  private readonly thresholds: PerformanceThresholds = {
    renderTime: 16.67, // 60fps
    interactionTime: 100, // Smooth interactions
    memoryUsage: 50 * 1024 * 1024, // 50MB
    frameRate: 60,
  };

  analyzePerformance(metrics: any): PerformanceReport {
    const recommendations: string[] = [];

    if (metrics.averageRenderTime > this.thresholds.renderTime) {
      recommendations.push('Consider optimizing render performance with React.memo or useMemo');
    }

    if (metrics.slowInteractions > metrics.interactionCount * 0.1) {
      recommendations.push('More than 10% of interactions are slow - consider debouncing or optimization');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > this.thresholds.memoryUsage) {
      recommendations.push('Memory usage is high - consider implementing cleanup strategies');
    }

    return {
      componentName: metrics.componentName || 'Unknown',
      timestamp: Date.now(),
      metrics,
      recommendations,
    };
  }

  detectBottlenecks(metrics: any): Array<{ type: string; severity: 'low' | 'medium' | 'high' }> {
    const bottlenecks: Array<{ type: string; severity: 'low' | 'medium' | 'high' }> = [];

    if (metrics.averageRenderTime > 50) {
      bottlenecks.push({ type: 'render_performance', severity: 'high' });
    } else if (metrics.averageRenderTime > 25) {
      bottlenecks.push({ type: 'render_performance', severity: 'medium' });
    }

    if (metrics.memoryPressure === 'critical') {
      bottlenecks.push({ type: 'memory_pressure', severity: 'high' });
    } else if (metrics.memoryPressure === 'high') {
      bottlenecks.push({ type: 'memory_pressure', severity: 'medium' });
    }

    return bottlenecks;
  }

  optimizationSuggestions(componentName: string, metrics: any): string[] {
    const suggestions: string[] = [];

    if (metrics.renderCount > 100 && metrics.averageRenderTime > 20) {
      suggestions.push(`Consider memoizing ${componentName} with React.memo`);
    }

    if (metrics.interactionCount > 50 && metrics.slowInteractions > 5) {
      suggestions.push(`Consider debouncing user interactions in ${componentName}`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 30 * 1024 * 1024) {
      suggestions.push(`Consider implementing cleanup strategies for ${componentName}`);
    }

    return suggestions;
  }
}

export const performanceService = new PerformanceService();
