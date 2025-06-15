
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface PerformanceThresholds {
  good: number;
  needsImprovement: number;
}

interface MetricThresholds {
  LCP: PerformanceThresholds;
  INP: PerformanceThresholds; // Changed from FID to INP
  CLS: PerformanceThresholds;
  FCP: PerformanceThresholds;
  TTFB: PerformanceThresholds;
}

interface PerformanceBudget {
  bundleSize: number; // in KB
  imageSize: number; // in KB
  totalPageSize: number; // in KB
  renderTime: number; // in ms
}

class PerformanceMetricsService {
  private metrics: Map<string, number> = new Map();
  private thresholds: MetricThresholds = {
    LCP: { good: 2500, needsImprovement: 4000 },
    INP: { good: 200, needsImprovement: 500 }, // Updated thresholds for INP
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 }
  };

  private budget: PerformanceBudget = {
    bundleSize: 250, // 250KB
    imageSize: 100, // 100KB per image
    totalPageSize: 500, // 500KB total
    renderTime: 16 // 16ms for 60fps
  };

  constructor() {
    this.initializeWebVitals();
    this.monitorResourceLoading();
    this.trackUserInteractions();
  }

  private initializeWebVitals() {
    // Track Core Web Vitals with enhanced error handling
    onCLS((metric) => {
      this.recordMetric('CLS', metric.value);
      this.checkThreshold('CLS', metric.value);
    });

    onFCP((metric) => {
      this.recordMetric('FCP', metric.value);
      this.checkThreshold('FCP', metric.value);
    });

    onINP((metric) => { // Changed from onFID to onINP
      this.recordMetric('INP', metric.value);
      this.checkThreshold('INP', metric.value);
    });

    onLCP((metric) => {
      this.recordMetric('LCP', metric.value);
      this.checkThreshold('LCP', metric.value);
    });

    onTTFB((metric) => {
      this.recordMetric('TTFB', metric.value);
      this.checkThreshold('TTFB', metric.value);
    });
  }

  private monitorResourceLoading() {
    if ('PerformanceObserver' in window) {
      // Monitor resource loading performance
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.checkResourceBudget(resourceEntry);
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource observer not supported');
      }

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
            this.recordMetric('longTask', entry.duration);
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  private trackUserInteractions() {
    // Track interaction responsiveness
    let interactionCount = 0;
    const trackInteraction = (eventType: string) => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        this.recordMetric(`${eventType}Latency`, duration);
        
        if (duration > this.budget.renderTime) {
          console.warn(`⚠️ Slow ${eventType} interaction: ${duration}ms`);
        }
        
        interactionCount++;
        if (interactionCount % 10 === 0) {
          this.generatePerformanceReport();
        }
      });
    };

    ['click', 'touchstart', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, () => trackInteraction(eventType), { passive: true });
    });
  }

  private checkResourceBudget(entry: PerformanceResourceTiming) {
    const size = entry.transferSize || 0;
    const sizeKB = size / 1024;

    if (entry.name.includes('.js') && sizeKB > this.budget.bundleSize) {
      console.warn(`⚠️ Bundle size exceeds budget: ${sizeKB.toFixed(2)}KB > ${this.budget.bundleSize}KB`);
    }

    if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)/) && sizeKB > this.budget.imageSize) {
      console.warn(`⚠️ Image size exceeds budget: ${sizeKB.toFixed(2)}KB > ${this.budget.imageSize}KB`);
    }
  }

  private recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    console.log(`📊 Performance metric: ${name} = ${value.toFixed(2)}`);
  }

  private checkThreshold(metricName: keyof MetricThresholds, value: number) {
    const threshold = this.thresholds[metricName];
    let status = '✅ Good';
    
    if (value > threshold.needsImprovement) {
      status = '❌ Poor';
    } else if (value > threshold.good) {
      status = '⚠️ Needs Improvement';
    }

    console.log(`📊 ${metricName}: ${value.toFixed(2)} - ${status}`);
  }

  public generatePerformanceReport() {
    const report = {
      coreWebVitals: {
        LCP: this.metrics.get('LCP'),
        INP: this.metrics.get('INP'), // Changed from FID to INP
        CLS: this.metrics.get('CLS'),
        FCP: this.metrics.get('FCP'),
        TTFB: this.metrics.get('TTFB')
      },
      interactions: {
        clickLatency: this.metrics.get('clickLatency'),
        touchLatency: this.metrics.get('touchstartLatency'),
        keyLatency: this.metrics.get('keydownLatency')
      },
      longTasks: this.metrics.get('longTask'),
      timestamp: new Date().toISOString()
    };

    console.log('📊 Performance Report:', report);
    return report;
  }

  public getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  public isPerformant(): boolean {
    const lcp = this.metrics.get('LCP') || 0;
    const inp = this.metrics.get('INP') || 0; // Changed from FID to INP
    const cls = this.metrics.get('CLS') || 0;

    return lcp <= this.thresholds.LCP.good && 
           inp <= this.thresholds.INP.good && // Updated threshold check
           cls <= this.thresholds.CLS.good;
  }
}

export const performanceMetrics = new PerformanceMetricsService();
