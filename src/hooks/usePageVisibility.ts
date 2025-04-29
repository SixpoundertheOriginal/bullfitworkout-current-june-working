
import { useState, useEffect } from 'react';

/**
 * Hook to detect when the page/tab visibility changes
 * This helps with detecting when a user switches tabs or minimizes the window
 */
export function usePageVisibility() {
  // Initialize with the current visibility state
  const [isVisible, setIsVisible] = useState<boolean>(
    typeof document !== 'undefined' ? !document.hidden : true
  );
  
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState | undefined>(
    typeof document !== 'undefined' ? document.visibilityState : undefined
  );
  
  useEffect(() => {
    // Define the visibility change handler
    const handleVisibilityChange = () => {
      // Update visibility status
      setIsVisible(!document.hidden);
      setVisibilityState(document.visibilityState);
      
      // Log visibility changes for debugging
      console.log('Visibility changed:', { 
        isVisible: !document.hidden, 
        state: document.visibilityState 
      });
    };
    
    // Only attach event listeners if document is available (client-side)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up the event listener
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);
  
  return { isVisible, visibilityState };
}
