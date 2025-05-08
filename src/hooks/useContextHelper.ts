
import { useMemo, useCallback } from 'react';

/**
 * Helper hook to create memoized context values with consistent patterns
 * Helps prevent unnecessary re-renders by memoizing both the value object 
 * and individual handler functions
 */
export function useContextHelper<T extends Record<string, any>>(
  initialValues: T, 
  dependencies: any[] = []
): T {
  // Memoize the entire context value object based on dependencies
  return useMemo(() => initialValues, dependencies);
}

/**
 * Helper to create memoized event handlers that won't cause re-renders
 * when passed to child components
 */
export function useMemoizedHandlers<T extends Record<string, (...args: any[]) => any>>(
  handlers: T
): T {
  const memoizedHandlers = {} as T;
  
  // Create a memoized version of each handler function
  Object.keys(handlers).forEach((key) => {
    // @ts-ignore - Dynamic key access is safe here
    memoizedHandlers[key] = useCallback(handlers[key], [handlers[key]]);
  });
  
  return memoizedHandlers;
}
