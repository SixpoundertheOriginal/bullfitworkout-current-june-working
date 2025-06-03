
import React, { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function LazyLoadWrapper({
  children,
  fallback,
  className = '',
  triggerOnce = true,
  rootMargin = '100px'
}: LazyLoadWrapperProps) {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    rootMargin,
    triggerOnce,
    threshold: 0.1
  });

  const defaultFallback = (
    <div className={`min-h-[200px] ${className}`}>
      <Skeleton className="w-full h-full" />
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {isIntersecting ? children : (fallback || defaultFallback)}
    </div>
  );
}
