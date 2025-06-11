
import { lazy } from 'react';

// Enhanced bundle splitting with Apple App Store optimization
export const LazyTrainingSession = lazy(() => 
  import('@/pages/TrainingSession').then(module => ({
    default: module.TrainingSession
  }))
);

export const LazyExerciseLibrary = lazy(() => 
  import('@/components/exercises/PerformanceOptimizedExerciseLibrary').then(module => ({
    default: module.PerformanceOptimizedExerciseLibrary
  }))
);

export const LazyWorkoutHistory = lazy(() => 
  import('@/pages/WorkoutHistory').then(module => ({
    default: module.WorkoutHistory
  }))
);

export const LazyProfileSettings = lazy(() => 
  import('@/pages/ProfileSettings').then(module => ({
    default: module.ProfileSettings
  }))
);

// Preload critical routes for instant navigation
export const preloadCriticalRoutes = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('@/pages/TrainingSession');
      import('@/components/exercises/PerformanceOptimizedExerciseLibrary');
    });
  } else {
    setTimeout(() => {
      import('@/pages/TrainingSession');
      import('@/components/exercises/PerformanceOptimizedExerciseLibrary');
    }, 2000);
  }
};

// Resource hints for critical resources
export const addResourceHints = () => {
  // Preconnect to external services
  const preconnectLinks = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  preconnectLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Prefetch critical assets
  const prefetchAssets = [
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
  ];

  prefetchAssets.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Performance optimization utilities
export const performanceOptimizations = {
  // Image optimization helper
  optimizeImage: (src: string, width?: number, height?: number) => {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('f', 'webp');
    params.append('q', '85');
    
    return src.includes('?') ? `${src}&${params}` : `${src}?${params}`;
  },

  // Lazy load images with intersection observer
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          img.onload = () => img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    observer.observe(img);
  }
};
