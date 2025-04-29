
import { useState, useEffect } from 'react';

/**
 * Hook to detect when the page/tab visibility changes
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(
    document.visibilityState
  );
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      setVisibilityState(document.visibilityState);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return { isVisible, visibilityState };
}
