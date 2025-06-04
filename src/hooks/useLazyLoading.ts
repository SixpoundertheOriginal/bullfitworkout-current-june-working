
import { useState, useEffect, useRef, useCallback } from 'react';

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  fallbackDelay?: number;
}

export function useLazyLoading(options: LazyLoadOptions = {}) {
  const {
    rootMargin = '100px',
    threshold = 0.1,
    fallbackDelay = 2000
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observeElement = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;

    // Fallback for older browsers
    if (!window.IntersectionObserver) {
      setTimeout(() => setIsInView(true), fallbackDelay);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(element);
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    observerRef.current.observe(element);
  }, [rootMargin, threshold, fallbackDelay]);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      observeElement(element);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observeElement]);

  const load = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return {
    elementRef,
    isInView,
    isLoaded,
    load,
    shouldLoad: isInView || isLoaded
  };
}

// Hook for lazy loading images
export function useLazyImage(src: string, options: LazyLoadOptions = {}) {
  const { elementRef, shouldLoad } = useLazyLoading(options);
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!shouldLoad || !src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.src = src;
  }, [shouldLoad, src]);

  return {
    elementRef,
    imageSrc,
    isLoading,
    hasError,
    shouldLoad
  };
}
