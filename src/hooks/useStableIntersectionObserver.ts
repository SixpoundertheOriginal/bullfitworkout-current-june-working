
import { useEffect, useState, useRef, useCallback } from 'react';

interface UseStableIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useStableIntersectionObserver(
  options: UseStableIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Stable options reference
  const stableOptions = useRef(options);
  stableOptions.current = options;

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with stable options
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: stableOptions.current.threshold || 0.5,
      rootMargin: stableOptions.current.rootMargin || "-100px"
    });

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  return { isIntersecting, targetRef };
}
