
import { useEffect, useRef, useCallback } from 'react';
import { cleanupManager } from '@/services/cleanupManager';

export function useCleanup(componentId?: string) {
  const scopeId = useRef<string>();
  const cleanupFunctions = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Create cleanup scope
    const id = componentId || `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    scopeId.current = cleanupManager.createScope(id);

    return () => {
      // Cleanup on unmount
      if (scopeId.current) {
        cleanupManager.cleanupScope(scopeId.current);
      }
      
      // Run local cleanups as fallback
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Local cleanup failed:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, [componentId]);

  const registerCleanup = useCallback((cleanup: () => void) => {
    if (scopeId.current) {
      cleanupManager.registerCleanup(scopeId.current, cleanup);
    }
    // Also store locally as backup
    cleanupFunctions.current.push(cleanup);
  }, []);

  return { registerCleanup };
}
