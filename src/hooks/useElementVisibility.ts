
import { useState, useEffect, useRef } from 'react';

interface UseElementVisibilityOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useElementVisibility = (options: UseElementVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const { threshold = 0, rootMargin = '0px' } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver !== 'function') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, isVisible };
};
