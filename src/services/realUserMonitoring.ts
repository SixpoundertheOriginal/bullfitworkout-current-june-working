
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
  private isProduction = process.env.NODE_ENV === 'production';

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
      // Monitor Long Tasks (>50ms) - throttled to prevent performance impact
      const longTaskObserver = new PerformanceObserver((list) => {
        // Only process in production to avoid development overhead
        if (!this.isProduction) return;
        
        list.getEntries().forEach((entry: PerformanceEntry) => {
          if (entry.duration > 50) {
            this.reportSlowTask(entry.name, entry.duration);
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }

      // Monitor Layout Shifts - throttled
      const layoutShiftObserver = new PerformanceObserver((list) => {
        if (!this.isProduction) return;
        
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        if (clsValue > 0.1) {
          this.reportLayoutShift(clsValue);
        }
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift observer not supported
      }
    }
  }

  private startFrameRateMonitoring() {
    let consecutiveLowFrames = 0;
    const maxConsecutiveReports = 3; // Limit consecutive reports
    
    const measureFrameRate = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= this.lastFrameTime + 1000) {
        const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        
        // Only report if fps is consistently low and limit reporting frequency
        if (fps < 55) {
          consecutiveLowFrames++;
          if (consecutiveLowFrames <= maxConsecutiveReports) {
            this.reportLowFrameRate(fps);
          }
        } else {
          consecutiveLowFrames = 0; // Reset counter on good performance
        }
        
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      
      this.frameRateMonitor = requestAnimationFrame(measureFrameRate);
    };

    this.frameRateMonitor = requestAnimationFrame(measureFrameRate);
  }

  private monitorMemoryUsage() {
    // Check memory less frequently to reduce overhead
    const checkMemory = () => {
      if ('memory' in performance && this.isProduction) {
        const memInfo = (performance as any).memory;
        const usageMB = memInfo.usedJSHeapSize / 1024 / 1024;
        
        if (usageMB > 200) {
          this.reportHighMemoryUsage(usageMB);
        }
      }
    };

    // Check every 30 seconds instead of 10 to reduce overhead
    setInterval(checkMemory, 30000);
  }

  private trackNetworkQuality() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Throttle network quality updates
      let lastUpdate = 0;
      const updateThrottle = 5000; // 5 seconds
      
      const updateNetworkQuality = () => {
        const now = Date.now();
        if (now - lastUpdate < updateThrottle) return;
        lastUpdate = now;
        
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
      this.reportError('javascript', event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportError('promise', event.reason?.toString() || 'Unknown promise rejection');
    });
  }

  // Reporting methods for analytics - optimized for performance
  private reportSlowTask(taskName: string, duration: number) {
    if (this.isProduction) {
      // In production, send to analytics service
      console.log(`📊 RUM: Slow task - ${taskName}: ${duration}ms`);
    }
  }

  private reportLayoutShift(clsValue: number) {
    if (this.isProduction) {
      console.log(`📊 RUM: Layout shift - CLS: ${clsValue}`);
    }
  }

  private reportLowFrameRate(fps: number) {
    if (this.isProduction) {
      console.log(`📊 RUM: Low frame rate - ${fps}fps`);
    }
  }

  private reportHighMemoryUsage(usageMB: number) {
    if (this.isProduction) {
      console.log(`📊 RUM: High memory usage - ${usageMB.toFixed(2)}MB`);
    }
  }

  private reportNetworkQuality(quality: 'fast' | 'slow' | 'offline') {
    if (this.isProduction) {
      console.log(`📊 RUM: Network quality - ${quality}`);
    }
  }

  private reportError(type: string, message: string) {
    if (this.isProduction) {
      console.log(`📊 RUM: Error - ${type}: ${message}`);
    }
  }

  // Public API for component performance tracking - optimized
  trackComponentRender(componentName: string, renderTime: number) {
    if (renderTime > 16 && this.isProduction) {
      console.warn(`⚡ Slow component render: ${componentName} (${renderTime}ms)`);
    }
  }

  trackUserInteraction(interactionType: string, responseTime: number) {
    if (responseTime > 100 && this.isProduction) {
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
