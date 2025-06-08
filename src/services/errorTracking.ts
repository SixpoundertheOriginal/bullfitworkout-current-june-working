interface ErrorContext {
  component?: string;
  hook?: string;
  userAction?: string;
  exerciseId?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface CrashData {
  error: Error;
  errorBoundary?: string;
  componentStack?: string;
  context: ErrorContext;
}

interface UserFlowStep {
  flowName: string;
  stepName: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

class ErrorTrackingService {
  private sessionId: string;
  private userId: string | null = null;
  private errorQueue: Array<CrashData> = [];
  private metricQueue: Array<PerformanceMetric> = [];
  private userFlowQueue: Array<UserFlowStep> = [];
  private isOnline = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNetworkStatusTracking();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), {
        component: 'Global',
        userAction: 'unknown',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        component: 'Promise',
        userAction: 'promise_rejection',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // React error boundary integration
    window.addEventListener('react-error-boundary', (event: any) => {
      this.reportCrashAnalytics({
        error: event.detail.error,
        errorBoundary: event.detail.errorBoundary,
        componentStack: event.detail.componentStack,
        context: {
          component: event.detail.component,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      });
    });
  }

  private setupNetworkStatusTracking() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueuedData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startPeriodicFlush() {
    // Flush data every 30 seconds if online
    setInterval(() => {
      if (this.isOnline) {
        this.flushQueuedData();
      }
    }, 30000);

    // Flush on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isOnline) {
        this.flushQueuedData();
      }
    });

    // Flush before page unload
    window.addEventListener('beforeunload', () => {
      this.flushQueuedDataSync();
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public captureError(error: Error, context: Partial<ErrorContext>) {
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      ...context
    };

    const crashData: CrashData = {
      error,
      context: fullContext
    };

    console.error('[ErrorTracking] Error captured:', error, fullContext);

    this.errorQueue.push(crashData);

    // Immediately flush critical errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      this.flushQueuedData();
    }

    // Store in localStorage for persistence
    this.persistToLocalStorage('errors', crashData);
  }

  public capturePerformanceMetric(name: string, value: number, context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        url: window.location.href,
        ...context
      }
    };

    console.log(`[ErrorTracking] Performance metric: ${name} = ${value}ms`, context);

    this.metricQueue.push(metric);

    // Store significant performance issues immediately
    if ((name.includes('render') && value > 100) || 
        (name.includes('load') && value > 2000)) {
      this.persistToLocalStorage('performance', metric);
    }
  }

  public trackUserFlow(flowName: string, stepName: string, success: boolean = true, metadata?: Record<string, any>) {
    const step: UserFlowStep = {
      flowName,
      stepName,
      timestamp: Date.now(),
      success,
      metadata: {
        userId: this.userId,
        sessionId: this.sessionId,
        url: window.location.href,
        ...metadata
      }
    };

    console.log(`[ErrorTracking] User flow: ${flowName}/${stepName}`, { success, metadata });

    this.userFlowQueue.push(step);

    // Track failed flows immediately
    if (!success) {
      this.persistToLocalStorage('userflows', step);
    }
  }

  public reportCrashAnalytics(crashData: CrashData) {
    console.error('[ErrorTracking] Crash reported:', crashData);

    this.errorQueue.push(crashData);
    this.persistToLocalStorage('crashes', crashData);

    // Immediate flush for crashes
    if (this.isOnline) {
      this.flushQueuedData();
    }
  }

  private persistToLocalStorage(type: string, data: any) {
    try {
      const key = `errorTracking_${type}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(data);
      
      // Keep only recent items to avoid storage bloat
      const recent = existing.slice(-50);
      localStorage.setItem(key, JSON.stringify(recent));
    } catch (error) {
      console.warn('Failed to persist error tracking data:', error);
    }
  }

  private async flushQueuedData() {
    if (!this.isOnline) return;

    try {
      // Combine all queued data
      const payload = {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        errors: [...this.errorQueue],
        metrics: [...this.metricQueue],
        userFlows: [...this.userFlowQueue]
      };

      // Clear queues
      this.errorQueue = [];
      this.metricQueue = [];
      this.userFlowQueue = [];

      // In a real app, this would send to your analytics service
      console.log('[ErrorTracking] Flushing data:', payload);

      // Simulate API call
      if (payload.errors.length > 0 || payload.metrics.length > 0 || payload.userFlows.length > 0) {
        await this.sendToAnalyticsService(payload);
      }

    } catch (error) {
      console.error('Failed to flush error tracking data:', error);
    }
  }

  private flushQueuedDataSync() {
    // Synchronous version for beforeunload
    if (!this.isOnline) return;

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      errors: [...this.errorQueue],
      metrics: [...this.metricQueue],
      userFlows: [...this.userFlowQueue]
    };

    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon && (payload.errors.length > 0 || payload.metrics.length > 0)) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
    }
  }

  private async sendToAnalyticsService(payload: any) {
    // In production, this would send to your actual analytics service
    // For now, we'll just log it
    console.log('[ErrorTracking] Would send to analytics:', {
      errors: payload.errors.length,
      metrics: payload.metrics.length,
      userFlows: payload.userFlows.length
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  public getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      queuedErrors: this.errorQueue.length,
      queuedMetrics: this.metricQueue.length,
      queuedUserFlows: this.userFlowQueue.length,
      isOnline: this.isOnline
    };
  }

  public clearStoredData() {
    ['errors', 'performance', 'userflows', 'crashes'].forEach(type => {
      localStorage.removeItem(`errorTracking_${type}`);
    });
  }

  public destroy() {
    this.flushQueuedDataSync();
  }
}

export const errorTracking = new ErrorTrackingService();

// Global error tracking instance
if (typeof window !== 'undefined') {
  (window as any).__ERROR_TRACKING__ = errorTracking;
}
