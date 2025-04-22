
import { useRef, useState, useEffect, RefObject } from 'react';

interface UseElementVisibilityOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useElementVisibility = (options: UseElementVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px'
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);
  
  return { ref, isVisible };
};
