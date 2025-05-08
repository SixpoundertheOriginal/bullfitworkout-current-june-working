
import { useState, useCallback, useMemo } from 'react';

/**
 * A hook that provides an optimized version of useState with memoized setter
 * functions and option to batch state updates for improved performance.
 * 
 * @template T - The type of state to manage
 * @param initialState - The initial state or function to create initial state
 * @returns An object with the state value and various state management functions
 */
export function useOptimizedState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState<T>(initialState);
  
  // Memoized setter to prevent unnecessary re-renders
  const setOptimizedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);
  
  /**
   * Update a specific key in an object state
   * @template K - The key type
   * @param key - The key to update
   * @param value - The new value or function to update value
   */
  const updateState = useCallback(<K extends keyof T>(
    key: K, 
    value: T[K] | ((prev: T[K]) => T[K])
  ) => {
    setState(prev => {
      // Handle functional updates
      const newValue = typeof value === 'function' 
        ? (value as (prev: T[K]) => T[K])(prev[key]) 
        : value;
      
      return {
        ...prev,
        [key]: newValue
      };
    });
  }, []);
  
  /**
   * Update multiple properties of an object state at once
   * @param partialState - Object containing key/value pairs to update
   */
  const batchUpdate = useCallback((partialState: Partial<T>) => {
    setState(prev => ({
      ...prev as object,
      ...partialState
    }) as T);
  }, []);
  
  /**
   * Reset state to its initial value
   */
  const resetState = useCallback(() => {
    setState(typeof initialState === 'function' 
      ? (initialState as () => T)() 
      : initialState
    );
  }, [initialState]);
  
  /**
   * Update state only if it has changed
   * @param newState - The new state value or function
   * @param equalityFn - Optional custom equality function
   */
  const setStateIfChanged = useCallback((
    newState: T | ((prev: T) => T),
    equalityFn?: (prevState: T, nextState: T) => boolean 
  ) => {
    setState(prevState => {
      const nextState = typeof newState === 'function'
        ? (newState as ((prev: T) => T))(prevState)
        : newState;
      
      // Compare using provided equality function or simple equality
      const isEqual = equalityFn 
        ? equalityFn(prevState, nextState)
        : Object.is(prevState, nextState);
      
      return isEqual ? prevState : nextState;
    });
  }, []);
  
  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    state,
    setState: setOptimizedState,
    updateState,
    batchUpdate,
    resetState,
    setStateIfChanged
  }), [state, setOptimizedState, updateState, batchUpdate, resetState, setStateIfChanged]);
}

/**
 * Optimized hook for managing array states with common operations
 */
export function useOptimizedArrayState<T>(initialState: T[] | (() => T[])) {
  const { state, setState } = useOptimizedState<T[]>(initialState);
  
  const addItem = useCallback((item: T) => {
    setState(prev => [...prev, item]);
  }, [setState]);
  
  const removeItem = useCallback((index: number) => {
    setState(prev => prev.filter((_, i) => i !== index));
  }, [setState]);
  
  const updateItem = useCallback((index: number, item: T | ((prev: T) => T)) => {
    setState(prev => prev.map((prevItem, i) => {
      if (i !== index) return prevItem;
      return typeof item === 'function'
        ? (item as (prev: T) => T)(prevItem)
        : item;
    }));
  }, [setState]);
  
  const removeItemBy = useCallback((predicate: (item: T, index: number) => boolean) => {
    setState(prev => prev.filter((item, index) => !predicate(item, index)));
  }, [setState]);
  
  return useMemo(() => ({
    items: state,
    setItems: setState,
    addItem,
    removeItem,
    updateItem,
    removeItemBy
  }), [state, setState, addItem, removeItem, updateItem, removeItemBy]);
}
