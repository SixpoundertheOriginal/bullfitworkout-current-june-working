
interface RUMMetrics {
  renderTime: number;
  interactionLatency: number;
  memoryUsage: number;
  networkQuality: 'fast' | 'slow' | 'offline';
  frameRate: number;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

class RealUserMonitoring {
  private metrics: RUMMetrics[] = [];
  private frameRateMonitor: number | null = null;
  private lastFrameTime = performance.now();
  private frameCount = 0;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor Core Web Vitals with enhanced tracking
    this.observePerformanceEntries();
    this.startFrameRateMonitoring();
    this.monitorMemoryUsage();
    this.trackNetworkQuality();
    this.setupErrorTracking();
  }

  private observePerformanceEntries() {
    if ('PerformanceObserver' in window) {
      // Monitor Long Tasks (>50ms)
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: PerformanceEntry) => {
          if (entry.duration > 50) {
            console.warn(`🐌 Long task detected: ${entry.name} (${entry.duration}ms)`);
            this.reportSlowTask(entry.name, entry.duration);
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Monitor Layout Shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        if (clsValue > 0.1) {
          console.warn(`📐 Layout shift detected: ${clsValue}`);
          this.reportLayoutShift(clsValue);
        }
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }
    }
  }

  private startFrameRateMonitoring() {
    const measureFrameRate = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= this.lastFrameTime + 1000) {
        const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        
        if (fps < 55) {
          console.warn(`📉 Low frame rate detected: ${fps}fps`);
          this.reportLowFrameRate(fps);
        }
        
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      
      this.frameRateMonitor = requestAnimationFrame(measureFrameRate);
    };

    this.frameRateMonitor = requestAnimationFrame(measureFrameRate);
  }

  private monitorMemoryUsage() {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const usageMB = memInfo.usedJSHeapSize / 1024 / 1024;
        
        if (usageMB > 200) {
          console.warn(`🧠 High memory usage: ${usageMB.toFixed(2)}MB`);
          this.reportHighMemoryUsage(usageMB);
        }
      }
    };

    setInterval(checkMemory, 10000); // Check every 10 seconds
  }

  private trackNetworkQuality() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkQuality = () => {
        let quality: 'fast' | 'slow' | 'offline' = 'fast';
        
        if (!navigator.onLine) {
          quality = 'offline';
        } else if (connection.effectiveType === '4g' && connection.downlink > 10) {
          quality = 'fast';
        } else {
          quality = 'slow';
        }
        
        this.reportNetworkQuality(quality);
      };

      connection.addEventListener('change', updateNetworkQuality);
      updateNetworkQuality();
    }
  }

  private setupErrorTracking() {
    // Enhanced error tracking for App Store quality
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      this.reportError('javascript', event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      this.reportError('promise', event.reason?.toString() || 'Unknown promise rejection');
    });
  }

  // Reporting methods for analytics
  private reportSlowTask(taskName: string, duration: number) {
    // In production, send to analytics service
    console.log(`📊 RUM: Slow task - ${taskName}: ${duration}ms`);
  }

  private reportLayoutShift(clsValue: number) {
    console.log(`📊 RUM: Layout shift - CLS: ${clsValue}`);
  }

  private reportLowFrameRate(fps: number) {
    console.log(`📊 RUM: Low frame rate - ${fps}fps`);
  }

  private reportHighMemoryUsage(usageMB: number) {
    console.log(`📊 RUM: High memory usage - ${usageMB.toFixed(2)}MB`);
  }

  private reportNetworkQuality(quality: 'fast' | 'slow' | 'offline') {
    console.log(`📊 RUM: Network quality - ${quality}`);
  }

  private reportError(type: string, message: string) {
    console.log(`📊 RUM: Error - ${type}: ${message}`);
  }

  // Public API for component performance tracking
  trackComponentRender(componentName: string, renderTime: number) {
    if (renderTime > 16) {
      console.warn(`⚡ Slow component render: ${componentName} (${renderTime}ms)`);
    }
  }

  trackUserInteraction(interactionType: string, responseTime: number) {
    if (responseTime > 100) {
      console.warn(`👆 Slow interaction: ${interactionType} (${responseTime}ms)`);
    }
  }

  destroy() {
    if (this.frameRateMonitor) {
      cancelAnimationFrame(this.frameRateMonitor);
    }
  }
}

export const realUserMonitoring = new RealUserMonitoring();
