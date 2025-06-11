
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' &&
    document.visibilityState === 'visible'
  );
  
  // Debounce visibility changes to prevent excessive updates
  const debouncedIsVisible = useDebounce(isVisible, 150);
  
  // Memoize the visibility handler to prevent recreation
  const handleVisibilityChange = useCallback(() => {
    const visible = document.visibilityState === 'visible';
    setIsVisible(visible);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check
    setIsVisible(document.visibilityState === 'visible');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
  
  return { isVisible: debouncedIsVisible };
}
