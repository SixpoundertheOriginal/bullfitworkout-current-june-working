interface ErrorContext {
  component?: string;
  userAction?: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  context?: Record<string, any>;
  timestamp: string;
}

interface UserFlowStep {
  component: string;
  step: string;
  success: boolean;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

class ErrorTrackingService {
  private sessionId: string;
  private errors: any[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private userFlows: UserFlowStep[] = [];
  private maxStoredItems = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupUnhandledRejectionHandler();
    this.setupPerformanceObserver();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), {
        component: 'Global',
        userAction: 'Page Load',
        url: event.filename,
        userAgent: navigator.userAgent
      });
    });
  }

  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason?.toString() || 'Unhandled Promise Rejection'), {
        component: 'Global',
        userAction: 'Promise Rejection',
        userAgent: navigator.userAgent
      });
    });
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.capturePerformanceMetric('long_task_duration', entry.duration, {
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Performance observer not supported');
      }
    }
  }

  public captureError(error: Error, context: ErrorContext = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: {
        ...context,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        buildVersion: process.env.VITE_BUILD_VERSION || 'development'
      }
    };

    this.errors.push(errorData);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxStoredItems) {
      this.errors = this.errors.slice(-this.maxStoredItems);
    }

    // Log to console for development
    console.error('🚨 Error captured:', errorData);

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    }
  }

  public capturePerformanceMetric(name: string, value: number, context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      context: {
        ...context,
        sessionId: this.sessionId
      },
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(metric);

    // Keep only the most recent metrics
    if (this.performanceMetrics.length > this.maxStoredItems) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxStoredItems);
    }

    // Log performance issues
    if (name.includes('slow') || value > 100) {
      console.warn(`⚠️ Performance metric: ${name} = ${value}ms`, context);
    }
  }

  public trackUserFlow(component: string, step: string, success: boolean, metadata?: Record<string, any>) {
    const flowStep: UserFlowStep = {
      component,
      step,
      success,
      metadata: {
        ...metadata,
        sessionId: this.sessionId
      },
      timestamp: new Date().toISOString()
    };

    this.userFlows.push(flowStep);

    // Keep only the most recent flow steps
    if (this.userFlows.length > this.maxStoredItems) {
      this.userFlows = this.userFlows.slice(-this.maxStoredItems);
    }

    console.log(`📈 User flow: ${component} > ${step} (${success ? 'success' : 'failed'})`, metadata);
  }

  private async sendToErrorService(errorData: any) {
    try {
      // In a real implementation, you would send to services like:
      // - Sentry
      // - Rollbar
      // - Bugsnag
      // - Custom error endpoint
      
      // Example implementation:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
      
      console.log('Would send error to tracking service:', errorData);
    } catch (sendError) {
      console.error('Failed to send error to tracking service:', sendError);
    }
  }

  public getSessionData() {
    return {
      sessionId: this.sessionId,
      errors: this.errors,
      performanceMetrics: this.performanceMetrics,
      userFlows: this.userFlows,
      timestamp: new Date().toISOString()
    };
  }

  public clearSession() {
    this.errors = [];
    this.performanceMetrics = [];
    this.userFlows = [];
    this.sessionId = this.generateSessionId();
  }

  public getErrorStats() {
    return {
      totalErrors: this.errors.length,
      errorsByComponent: this.errors.reduce((acc, error) => {
        const component = error.context?.component || 'Unknown';
        acc[component] = (acc[component] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentErrors: this.errors.slice(-5)
    };
  }
}

export const errorTracking = new ErrorTrackingService();

// Global error tracking instance
if (typeof window !== 'undefined') {
  (window as any).__ERROR_TRACKING__ = errorTracking;
}
