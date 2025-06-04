
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCleanup } from './useCleanup';

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
  const { registerCleanup } = useCleanup('lazy-loading');

  const observeElement = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;

    // Fallback for older browsers
    if (!window.IntersectionObserver) {
      const timeout = setTimeout(() => setIsInView(true), fallbackDelay);
      registerCleanup(() => clearTimeout(timeout));
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
    
    // Register cleanup for the observer
    registerCleanup(() => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    });
  }, [rootMargin, threshold, fallbackDelay, registerCleanup]);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      observeElement(element);
    }
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
  const { registerCleanup } = useCleanup('lazy-image');

  useEffect(() => {
    if (!shouldLoad || !src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    // Register cleanup to prevent memory leaks
    registerCleanup(() => {
      img.onload = null;
      img.onerror = null;
      img.src = '';
    });
  }, [shouldLoad, src, registerCleanup]);

  return {
    elementRef,
    imageSrc,
    isLoading,
    hasError,
    shouldLoad
  };
}
