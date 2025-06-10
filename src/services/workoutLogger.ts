// Comprehensive logging and monitoring for workout operations
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  operation: string;
  message: string;
  data?: any;
  performanceMetrics?: {
    duration?: number;
    memoryUsage?: number;
    dataSize?: number;
  };
  userContext?: {
    userId?: string;
    workoutId?: string;
    exerciseCount?: number;
  };
}

class WorkoutLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private performanceMarks = new Map<string, number>();

  log(level: LogEntry['level'], operation: string, message: string, data?: any, userContext?: LogEntry['userContext']) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      message,
      data,
      userContext
    };

    this.logs.push(entry);
    
    // Trim logs if we exceed max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (import.meta.env.DEV) {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : 
                       level === 'debug' ? console.debug : console.log;
      
      logMethod(`[Workout ${level.toUpperCase()}] ${operation}: ${message}`, data || '');
    }

    // In production, could send to external monitoring service
    if (import.meta.env.PROD && level === 'error') {
      this.sendToMonitoring(entry);
    }
  }

  logInfo(message: string, data?: any, userContext?: LogEntry['userContext']) {
    this.log('info', 'general', message, data, userContext);
  }

  logWarn(message: string, data?: any, userContext?: LogEntry['userContext']) {
    this.log('warn', 'general', message, data, userContext);
  }

  logError(message: string, error?: any, userContext?: LogEntry['userContext']) {
    this.log('error', 'general', message, { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    }, userContext);
  }

  logValidation(result: { isValid: boolean; errorCount: number; warningCount: number; workout: string; setCount: number }) {
    this.log('info', 'validation', `Workout validation: ${result.isValid ? 'PASSED' : 'FAILED'}`, result);
  }

  logSaveOperation(operation: 'start' | 'success' | 'failure', data?: any, userContext?: LogEntry['userContext']) {
    const level = operation === 'failure' ? 'error' : 'info';
    this.log(level, 'save', `Workout save ${operation}`, data, userContext);
  }

  logDataFlow(stage: string, data?: any, userContext?: LogEntry['userContext']) {
    this.log('debug', 'dataFlow', `Data flow stage: ${stage}`, data, userContext);
  }

  // Performance monitoring
  startPerformanceMark(markName: string) {
    this.performanceMarks.set(markName, performance.now());
  }

  endPerformanceMark(markName: string, operation?: string) {
    const startTime = this.performanceMarks.get(markName);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(markName);
      
      this.log('debug', operation || 'performance', `Performance mark ${markName}`, {
        duration: Math.round(duration * 100) / 100,
        unit: 'ms'
      });

      // Warn on slow operations
      if (duration > 100) {
        this.log('warn', 'performance', `Slow operation detected: ${markName}`, { duration });
      }

      return duration;
    }
    return 0;
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogEntry['level'], count = 50): LogEntry[] {
    return this.logs.filter(log => log.level === level).slice(-count);
  }

  // Get logs by operation
  getLogsByOperation(operation: string, count = 50): LogEntry[] {
    return this.logs.filter(log => log.operation === operation).slice(-count);
  }

  // Export logs for support
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.performanceMarks.clear();
  }

  private sendToMonitoring(entry: LogEntry) {
    // In a real app, this would send to Sentry, LogRocket, etc.
    // For now, just store in sessionStorage for debugging
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('workout_errors') || '[]');
      existingErrors.push(entry);
      
      // Keep only last 20 errors
      if (existingErrors.length > 20) {
        existingErrors.splice(0, existingErrors.length - 20);
      }
      
      sessionStorage.setItem('workout_errors', JSON.stringify(existingErrors));
    } catch (error) {
      console.error('Failed to store error log:', error);
    }
  }
}

export const workoutLogger = new WorkoutLogger();

// Export for development/debugging
if (import.meta.env.DEV) {
  (window as any).workoutLogger = workoutLogger;
}
