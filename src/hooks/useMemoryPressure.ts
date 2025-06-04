
import { useState, useEffect } from 'react';
import { cleanupManager } from '@/services/cleanupManager';
import { exerciseCardPool } from '@/services/exerciseCardPool';
import { networkOptimization } from '@/services/networkOptimization';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function useMemoryPressure() {
  const [memoryPressure, setMemoryPressure] = useState<'low' | 'medium' | 'high'>('low');
  const [isHighMemoryUsage, setIsHighMemoryUsage] = useState(false);

  useEffect(() => {
    const checkMemoryPressure = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory as MemoryInfo;
        const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        let pressure: 'low' | 'medium' | 'high' = 'low';
        if (usageRatio > 0.8) {
          pressure = 'high';
          // Aggressive cleanup at high memory pressure
          handleHighMemoryPressure();
        } else if (usageRatio > 0.6) {
          pressure = 'medium';
          // Moderate cleanup at medium pressure
          handleMediumMemoryPressure();
        }
        
        setMemoryPressure(pressure);
        setIsHighMemoryUsage(pressure === 'high');
      }
    };

    const handleHighMemoryPressure = () => {
      console.log('High memory pressure detected - triggering cleanup');
      
      // Release pooled resources
      exerciseCardPool.cleanup();
      
      // Clear network caches
      networkOptimization.clearCache();
      
      // Run cleanup for old scopes
      const stats = cleanupManager.getStats();
      const oldScopes = stats.scopeDetails.filter(scope => scope.age > 300000); // 5 minutes
      oldScopes.forEach(scope => cleanupManager.cleanupScope(scope.id));
      
      // Force garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    };

    const handleMediumMemoryPressure = () => {
      console.log('Medium memory pressure detected - moderate cleanup');
      
      // Partial cleanup of old resources
      const stats = cleanupManager.getStats();
      const veryOldScopes = stats.scopeDetails.filter(scope => scope.age > 600000); // 10 minutes
      veryOldScopes.forEach(scope => cleanupManager.cleanupScope(scope.id));
    };

    // Check initially
    checkMemoryPressure();

    // Check periodically
    const interval = setInterval(checkMemoryPressure, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    memoryPressure,
    isHighMemoryUsage
  };
}
