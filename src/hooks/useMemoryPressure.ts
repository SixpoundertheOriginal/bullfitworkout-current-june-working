
import { useState, useEffect } from 'react';

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
        } else if (usageRatio > 0.6) {
          pressure = 'medium';
        }
        
        setMemoryPressure(pressure);
        setIsHighMemoryUsage(pressure === 'high');
      }
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
