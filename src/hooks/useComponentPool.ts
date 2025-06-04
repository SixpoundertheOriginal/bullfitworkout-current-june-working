
import { useEffect, useRef, useCallback } from 'react';

interface PoolOptions {
  maxSize?: number;
  cleanupInterval?: number;
  maxAge?: number;
}

interface PooledComponent<T> {
  id: string;
  data: T;
  isInUse: boolean;
  lastUsed: number;
  createdAt: number;
}

export function useComponentPool<T>(
  createComponent: () => T,
  resetComponent: (component: T) => void,
  options: PoolOptions = {}
) {
  const {
    maxSize = 20,
    cleanupInterval = 30000,
    maxAge = 300000 // 5 minutes
  } = options;

  const pool = useRef<PooledComponent<T>[]>([]);
  const cleanupTimer = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    const now = Date.now();
    pool.current = pool.current.filter(component => {
      if (!component.isInUse && (now - component.lastUsed) > maxAge) {
        return false;
      }
      return true;
    });
  }, [maxAge]);

  const getComponent = useCallback((): PooledComponent<T> | null => {
    // Find an unused component
    const available = pool.current.find(comp => !comp.isInUse);
    
    if (available) {
      available.isInUse = true;
      available.lastUsed = Date.now();
      resetComponent(available.data);
      return available;
    }

    // Create new component if pool has space
    if (pool.current.length < maxSize) {
      const newComponent: PooledComponent<T> = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: createComponent(),
        isInUse: true,
        lastUsed: Date.now(),
        createdAt: Date.now()
      };
      pool.current.push(newComponent);
      return newComponent;
    }

    return null;
  }, [createComponent, resetComponent, maxSize]);

  const releaseComponent = useCallback((componentId: string) => {
    const component = pool.current.find(comp => comp.id === componentId);
    if (component) {
      component.isInUse = false;
      component.lastUsed = Date.now();
    }
  }, []);

  const getPoolStats = useCallback(() => {
    return {
      total: pool.current.length,
      inUse: pool.current.filter(c => c.isInUse).length,
      available: pool.current.filter(c => !c.isInUse).length
    };
  }, []);

  // Setup cleanup interval
  useEffect(() => {
    cleanupTimer.current = setInterval(cleanup, cleanupInterval);
    
    return () => {
      if (cleanupTimer.current) {
        clearInterval(cleanupTimer.current);
      }
    };
  }, [cleanup, cleanupInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pool.current = [];
    };
  }, []);

  return {
    getComponent,
    releaseComponent,
    getPoolStats,
    cleanup
  };
}
