
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetrics {
  coreWebVitals: {
    cls: number | null;
    fcp: number | null;
    fid: number | null;
    lcp: number | null;
    ttfb: number | null;
  };
  queryMetrics: {
    totalQueries: number;
    queryDuration: number[];
    cacheHitRatio: number;
    backgroundRefreshCount: number;
  };
  memoryMetrics: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    memoryPressure: 'low' | 'medium' | 'high';
  };
  renderMetrics: {
    componentRenders: Map<string, number>;
    renderDuration: number[];
    unnecessaryRenders: number;
  };
}

interface PerformanceNavigationTimingEntry extends PerformanceEntry {
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  loadEventEnd: number;
  loadEventStart: number;
  fetchStart: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.metrics = {
      coreWebVitals: {
        cls: null,
        fcp: null,
        fid: null,
        lcp: null,
        ttfb: null
      },
      queryMetrics: {
        totalQueries: 0,
        queryDuration: [],
        cacheHitRatio: 0,
        backgroundRefreshCount: 0
      },
      memoryMetrics: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryPressure: 'low'
      },
      renderMetrics: {
        componentRenders: new Map(),
        renderDuration: [],
        unnecessaryRenders: 0
      }
    };
    this.startTime = performance.now();
    this.initializeCoreWebVitals();
    this.initializePerformanceObservers();
  }

  private initializeCoreWebVitals() {
    onCLS((metric) => {
      this.metrics.coreWebVitals.cls = metric.value;
      this.logMetric('CLS', metric.value, metric.value > 0.1 ? 'poor' : metric.value > 0.05 ? 'needs-improvement' : 'good');
    });

    onFCP((metric) => {
      this.metrics.coreWebVitals.fcp = metric.value;
      this.logMetric('FCP', metric.value, metric.value > 3000 ? 'poor' : metric.value > 1800 ? 'needs-improvement' : 'good');
    });

    onFID((metric) => {
      this.metrics.coreWebVitals.fid = metric.value;
      this.logMetric('FID', metric.value, metric.value > 300 ? 'poor' : metric.value > 100 ? 'needs-improvement' : 'good');
    });

    onLCP((metric) => {
      this.metrics.coreWebVitals.lcp = metric.value;
      this.logMetric('LCP', metric.value, metric.value > 4000 ? 'poor' : metric.value > 2500 ? 'needs-improvement' : 'good');
    });

    onTTFB((metric) => {
      this.metrics.coreWebVitals.ttfb = metric.value;
      this.logMetric('TTFB', metric.value, metric.value > 800 ? 'poor' : metric.value > 200 ? 'needs-improvement' : 'good');
    });
  }

  private initializePerformanceObservers() {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTimingEntry;
            console.log('[PerformanceMonitor] Navigation timing:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        }
      });
      
      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('[PerformanceMonitor] Navigation observer not supported');
      }
    }
  }

  trackQuery(queryKey: string, duration: number, fromCache: boolean) {
    this.metrics.queryMetrics.totalQueries++;
    this.metrics.queryMetrics.queryDuration.push(duration);
    
    if (fromCache) {
      this.metrics.queryMetrics.cacheHitRatio = 
        (this.metrics.queryMetrics.cacheHitRatio * (this.metrics.queryMetrics.totalQueries - 1) + 1) / 
        this.metrics.queryMetrics.totalQueries;
    } else {
      this.metrics.queryMetrics.cacheHitRatio = 
        (this.metrics.queryMetrics.cacheHitRatio * (this.metrics.queryMetrics.totalQueries - 1)) / 
        this.metrics.queryMetrics.totalQueries;
    }

    console.log(`[PerformanceMonitor] Query "${queryKey}": ${duration}ms, fromCache: ${fromCache}`);
  }

  trackBackgroundRefresh() {
    this.metrics.queryMetrics.backgroundRefreshCount++;
    console.log('[PerformanceMonitor] Background refresh performed');
  }

  trackComponentRender(componentName: string, renderDuration: number, wasNecessary: boolean) {
    const currentCount = this.metrics.renderMetrics.componentRenders.get(componentName) || 0;
    this.metrics.renderMetrics.componentRenders.set(componentName, currentCount + 1);
    this.metrics.renderMetrics.renderDuration.push(renderDuration);
    
    if (!wasNecessary) {
      this.metrics.renderMetrics.unnecessaryRenders++;
    }

    console.log(`[PerformanceMonitor] Component "${componentName}" rendered in ${renderDuration}ms, necessary: ${wasNecessary}`);
  }

  measureMemoryUsage() {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryMetrics = {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        memoryPressure: this.calculateMemoryPressure(memInfo)
      };

      console.log('[PerformanceMonitor] Memory usage:', {
        used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        pressure: this.metrics.memoryMetrics.memoryPressure
      });
    }
  }

  private calculateMemoryPressure(memInfo: any): 'low' | 'medium' | 'high' {
    const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
    if (usageRatio > 0.8) return 'high';
    if (usageRatio > 0.6) return 'medium';
    return 'low';
  }

  private logMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`[PerformanceMonitor] ${emoji} ${name}: ${value.toFixed(2)}ms (${rating})`);
  }

  generateReport(): PerformanceMetrics {
    this.measureMemoryUsage();
    
    const report = { ...this.metrics };
    const avgQueryDuration = report.queryMetrics.queryDuration.length > 0 
      ? report.queryMetrics.queryDuration.reduce((a, b) => a + b, 0) / report.queryMetrics.queryDuration.length 
      : 0;
    const avgRenderDuration = report.renderMetrics.renderDuration.length > 0
      ? report.renderMetrics.renderDuration.reduce((a, b) => a + b, 0) / report.renderMetrics.renderDuration.length 
      : 0;

    console.log('[PerformanceMonitor] 📊 Performance Report:', {
      coreWebVitals: report.coreWebVitals,
      queries: {
        total: report.queryMetrics.totalQueries,
        avgDuration: `${avgQueryDuration.toFixed(2)}ms`,
        cacheHitRatio: `${(report.queryMetrics.cacheHitRatio * 100).toFixed(1)}%`,
        backgroundRefreshes: report.queryMetrics.backgroundRefreshCount
      },
      rendering: {
        totalComponents: report.renderMetrics.componentRenders.size,
        avgRenderTime: `${avgRenderDuration.toFixed(2)}ms`,
        unnecessaryRenders: report.renderMetrics.unnecessaryRenders,
        renderEfficiency: `${((1 - report.renderMetrics.unnecessaryRenders / 
          Array.from(report.renderMetrics.componentRenders.values()).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
      },
      memory: {
        usage: `${(report.memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        pressure: report.memoryMetrics.memoryPressure
      }
    });

    return report;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
