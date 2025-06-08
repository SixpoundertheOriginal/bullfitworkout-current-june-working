
import { performanceMonitor } from './performanceMonitor';
import { cleanupManager } from './cleanupManager';

interface MemoryPressureLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  usagePercentage: number;
  recommendedAction: string;
}

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  pressureLevel: MemoryPressureLevel;
}

// Extend window interface for React Query client
declare global {
  interface Window {
    __REACT_QUERY_CLIENT__?: any;
  }
}

class MemoryManager {
  private memoryCheckInterval: NodeJS.Timeout | null = null;
  private gcForceTimer: NodeJS.Timeout | null = null;
  private memoryPressureCallbacks = new Set<(level: MemoryPressureLevel) => void>();
  private lastCleanupTime = 0;
  private readonly CLEANUP_COOLDOWN = 30000; // 30 seconds between major cleanups

  constructor() {
    this.startMemoryMonitoring();
    this.setupMemoryPressureHandling();
  }

  private startMemoryMonitoring() {
    // Check memory every 10 seconds for mobile optimization
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryPressure();
    }, 10000);

    // Listen for visibility change to trigger cleanup when app goes to background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performBackgroundCleanup();
      }
    });
  }

  private setupMemoryPressureHandling() {
    // Listen for native memory pressure events if available
    if ('memory' in navigator) {
      // Modern browsers support memory pressure events
      window.addEventListener('memory-pressure', this.handleNativeMemoryPressure.bind(this));
    }

    // Listen for page lifecycle events
    window.addEventListener('pagehide', () => {
      this.performEmergencyCleanup();
    });
  }

  private handleNativeMemoryPressure(event: any) {
    const level = event.detail?.level || 'medium';
    console.log(`Native memory pressure detected: ${level}`);
    this.handleMemoryPressure(this.mapNativeLevel(level));
  }

  private mapNativeLevel(nativeLevel: string): MemoryPressureLevel {
    const mapping: Record<string, MemoryPressureLevel> = {
      'low': { level: 'low', usagePercentage: 50, recommendedAction: 'monitor' },
      'moderate': { level: 'medium', usagePercentage: 70, recommendedAction: 'cleanup_background' },
      'critical': { level: 'high', usagePercentage: 85, recommendedAction: 'aggressive_cleanup' }
    };
    return mapping[nativeLevel] || mapping['moderate'];
  }

  public checkMemoryPressure(): MemoryMetrics | null {
    if (!('memory' in performance)) {
      return null;
    }

    const memInfo = (performance as any).memory;
    const usagePercentage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
    
    let pressureLevel: MemoryPressureLevel;
    
    if (usagePercentage > 90) {
      pressureLevel = { level: 'critical', usagePercentage, recommendedAction: 'emergency_cleanup' };
    } else if (usagePercentage > 75) {
      pressureLevel = { level: 'high', usagePercentage, recommendedAction: 'aggressive_cleanup' };
    } else if (usagePercentage > 60) {
      pressureLevel = { level: 'medium', usagePercentage, recommendedAction: 'selective_cleanup' };
    } else {
      pressureLevel = { level: 'low', usagePercentage, recommendedAction: 'normal_operation' };
    }

    const metrics: MemoryMetrics = {
      usedJSHeapSize: memInfo.usedJSHeapSize,
      totalJSHeapSize: memInfo.totalJSHeapSize,
      jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
      pressureLevel
    };

    this.handleMemoryPressure(pressureLevel);
    this.notifyMemoryPressureCallbacks(pressureLevel);

    return metrics;
  }

  private handleMemoryPressure(pressureLevel: MemoryPressureLevel) {
    const now = Date.now();
    
    switch (pressureLevel.level) {
      case 'critical':
        this.performEmergencyCleanup();
        break;
      case 'high':
        if (now - this.lastCleanupTime > this.CLEANUP_COOLDOWN) {
          this.performAggressiveCleanup();
          this.lastCleanupTime = now;
        }
        break;
      case 'medium':
        if (now - this.lastCleanupTime > this.CLEANUP_COOLDOWN * 2) {
          this.performSelectiveCleanup();
          this.lastCleanupTime = now;
        }
        break;
      case 'low':
        // Normal operation - no cleanup needed
        break;
    }
  }

  private performEmergencyCleanup() {
    console.log('🚨 Emergency memory cleanup initiated');
    
    // Clear all non-critical caches immediately
    cleanupManager.cleanupAll();
    
    // Clear React Query cache except active queries
    if (window.__REACT_QUERY_CLIENT__) {
      window.__REACT_QUERY_CLIENT__.clear();
    }
    
    // Force garbage collection if available
    this.forceGarbageCollection();
    
    // Notify components to release resources
    window.dispatchEvent(new CustomEvent('emergency-memory-cleanup'));
  }

  private performAggressiveCleanup() {
    console.log('⚡ Aggressive memory cleanup initiated');
    
    // Clean up old scopes
    const stats = cleanupManager.getStats();
    stats.scopeDetails
      .filter(scope => scope.age > 300000) // 5 minutes
      .forEach(scope => cleanupManager.cleanupScope(scope.id));
    
    // Clear background caches
    this.clearBackgroundCaches();
    
    // Suggest garbage collection
    this.scheduleGarbageCollection();
  }

  private performSelectiveCleanup() {
    console.log('🧹 Selective memory cleanup initiated');
    
    // Clean up very old scopes only
    const stats = cleanupManager.getStats();
    stats.scopeDetails
      .filter(scope => scope.age > 600000) // 10 minutes
      .forEach(scope => cleanupManager.cleanupScope(scope.id));
  }

  private performBackgroundCleanup() {
    console.log('🌙 Background memory cleanup initiated');
    
    // Clean up when app goes to background
    this.clearBackgroundCaches();
    this.scheduleGarbageCollection();
  }

  private clearBackgroundCaches() {
    // Clear image caches
    if ('caches' in window) {
      caches.open('exercise-images').then(cache => {
        // Keep only recent images
        // Implementation would depend on your caching strategy
      });
    }
    
    // Clear IndexedDB old entries
    this.cleanupIndexedDB();
  }

  private async cleanupIndexedDB() {
    try {
      // Clean up old exercise data from IndexedDB
      // This would depend on your IndexedDB structure
      console.log('IndexedDB cleanup completed');
    } catch (error) {
      console.error('IndexedDB cleanup failed:', error);
    }
  }

  private forceGarbageCollection() {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
        console.log('✅ Garbage collection forced');
      } catch (error) {
        console.warn('Garbage collection failed:', error);
      }
    }
  }

  private scheduleGarbageCollection() {
    // Clear any existing timer
    if (this.gcForceTimer) {
      clearTimeout(this.gcForceTimer);
    }
    
    // Schedule GC for when user is likely idle
    this.gcForceTimer = setTimeout(() => {
      this.forceGarbageCollection();
    }, 5000);
  }

  public onMemoryPressure(callback: (level: MemoryPressureLevel) => void) {
    this.memoryPressureCallbacks.add(callback);
    return () => this.memoryPressureCallbacks.delete(callback);
  }

  private notifyMemoryPressureCallbacks(level: MemoryPressureLevel) {
    this.memoryPressureCallbacks.forEach(callback => {
      try {
        callback(level);
      } catch (error) {
        console.error('Memory pressure callback error:', error);
      }
    });
  }

  public getMemoryMetrics(): MemoryMetrics | null {
    return this.checkMemoryPressure();
  }

  public destroy() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
    if (this.gcForceTimer) {
      clearTimeout(this.gcForceTimer);
    }
    this.memoryPressureCallbacks.clear();
  }
}

export const memoryManager = new MemoryManager();

// Global memory manager instance for module imports
if (typeof window !== 'undefined') {
  (window as any).__MEMORY_MANAGER__ = memoryManager;
}
