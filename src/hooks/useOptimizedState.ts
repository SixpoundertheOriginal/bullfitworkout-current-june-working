
import { useState, useCallback, useMemo } from 'react';

/**
 * A hook that provides an optimized version of useState with memoized setter
 * functions and option to batch state updates for improved performance.
 */
export function useOptimizedState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState<T>(initialState);
  
  // Memoized setter to prevent unnecessary re-renders
  const setOptimizedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);
  
  // Utility for partial updates (useful for object states)
  const updateState = useCallback((partialState: Partial<T>) => {
    setState(prev => ({
      ...prev as object,
      ...partialState
    }) as T);
  }, []);
  
  // Reset state to initial value
  const resetState = useCallback(() => {
    setState(typeof initialState === 'function' 
      ? (initialState as () => T)() 
      : initialState
    );
  }, [initialState]);
  
  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    state,
    setState: setOptimizedState,
    updateState,
    resetState
  }), [state, setOptimizedState, updateState, resetState]);
}
