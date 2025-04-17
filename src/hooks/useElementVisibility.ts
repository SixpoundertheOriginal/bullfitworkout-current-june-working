
import { useEffect, useState, RefObject } from 'react';

interface UseElementVisibilityOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useElementVisibility = (
  elementRef: RefObject<Element>,
  options: UseElementVisibilityOptions = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
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
  }, [elementRef, options.threshold, options.rootMargin]);
  
  return isVisible;
};
