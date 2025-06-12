
import { lazy } from 'react';

// Optimized bundle splitting with performance focus
export const LazyTrainingSession = lazy(() => 
  import('@/pages/TrainingSession').then(module => ({
    default: module.default
  }))
);

export const LazyExerciseLibrary = lazy(() => 
  import('@/components/exercises/PerformanceOptimizedExerciseLibrary').then(module => ({
    default: module.PerformanceOptimizedExerciseLibrary
  }))
);

export const LazyWorkoutDetails = lazy(() => 
  import('@/pages/WorkoutDetailsPage').then(module => ({
    default: module.default
  }))
);

export const LazyProfilePage = lazy(() => 
  import('@/pages/ProfilePage').then(module => ({
    default: module.default
  }))
);

// Streamlined preloading for critical routes only
export const preloadCriticalRoutes = () => {
  const criticalImports = [
    () => import('@/pages/TrainingSession'),
    () => import('@/components/exercises/PerformanceOptimizedExerciseLibrary'),
  ];

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      criticalImports.forEach(importFn => {
        importFn().catch(() => {}); // Silent fail for preloads
      });
    });
  } else {
    setTimeout(() => {
      criticalImports.forEach(importFn => {
        importFn().catch(() => {});
      });
    }, 1000);
  }
};

// Simplified resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'preload', href: '/src/index.css', as: 'style' },
  ];

  hints.forEach(hint => {
    const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    Object.entries(hint).forEach(([key, value]) => {
      if (key === 'crossOrigin') {
        link.crossOrigin = value as string;
      } else {
        link.setAttribute(key, value as string);
      }
    });
    document.head.appendChild(link);
  });
};

// Optimized performance utilities
export const performanceOptimizations = {
  optimizeImage: (src: string, width?: number, height?: number) => {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('f', 'webp');
    params.append('q', '85');
    
    return src.includes('?') ? `${src}&${params}` : `${src}?${params}`;
  },

  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            img.src = src;
            img.onload = () => {
              requestAnimationFrame(() => {
                img.classList.add('loaded');
              });
            };
            observer.unobserve(img);
          });
        }
      });
    }, { 
      rootMargin: '50px',
      threshold: 0.1 
    });

    observer.observe(img);
    
    return () => observer.disconnect();
  }
};
