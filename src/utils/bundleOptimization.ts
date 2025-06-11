
import { lazy } from 'react';

// Enhanced bundle splitting with aggressive preloading for TTFB optimization
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

// Aggressive preloading for <200ms TTFB target
export const preloadCriticalRoutes = () => {
  // Use multiple strategies for maximum performance
  const preloadStrategies = [
    () => {
      // Strategy 1: Immediate preload of critical routes
      const criticalImports = [
        () => import('@/pages/TrainingSession'),
        () => import('@/components/exercises/PerformanceOptimizedExerciseLibrary'),
        () => import('@/pages/WorkoutDetailsPage'),
      ];

      criticalImports.forEach(importFn => {
        importFn().catch(() => {}); // Silent fail for preloads
      });
    },
    () => {
      // Strategy 2: RequestIdleCallback for non-critical
      const nonCriticalImports = [
        () => import('@/pages/ProfilePage'),
        () => import('@/components/exercises/VirtualizedExerciseGrid'),
      ];

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          nonCriticalImports.forEach(importFn => {
            importFn().catch(() => {});
          });
        });
      } else {
        setTimeout(() => {
          nonCriticalImports.forEach(importFn => {
            importFn().catch(() => {});
          });
        }, 1000);
      }
    }
  ];

  // Execute all strategies
  preloadStrategies.forEach(strategy => strategy());
};

// Enhanced resource hints for TTFB optimization
export const addResourceHints = () => {
  const hints = [
    // Critical DNS preconnects
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    
    // Critical resource preloads
    { rel: 'preload', href: '/icons/icon-192x192.png', as: 'image' },
    { rel: 'preload', href: '/icons/icon-512x512.png', as: 'image' },
    
    // Critical CSS preload
    { rel: 'preload', href: '/src/index.css', as: 'style' },
  ];

  // Add cache-friendly headers
  const addHint = (hint: any) => {
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
  };

  hints.forEach(addHint);

  // Add critical resource prefetch for next navigation
  const prefetchAssets = [
    '/src/pages/TrainingSession.tsx',
    '/src/components/exercises/PerformanceOptimizedExerciseLibrary.tsx',
  ];

  // Delay prefetch to not interfere with critical loading
  setTimeout(() => {
    prefetchAssets.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, 2000);
};

// Performance optimization utilities with frame rate targeting
export const performanceOptimizations = {
  // Optimized image loading for 60fps
  optimizeImage: (src: string, width?: number, height?: number) => {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('f', 'webp');
    params.append('q', '85');
    
    return src.includes('?') ? `${src}&${params}` : `${src}?${params}`;
  },

  // Enhanced lazy loading with frame rate consideration
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    let frameId: number;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame to avoid blocking the main thread
          frameId = requestAnimationFrame(() => {
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
    
    // Cleanup function
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      observer.disconnect();
    };
  },

  // Worker optimization for communication overhead
  optimizeWorkerCommunication: () => {
    const messageQueue: any[] = [];
    let processingQueue = false;

    return {
      batchMessage: (message: any) => {
        messageQueue.push(message);
        
        if (!processingQueue) {
          processingQueue = true;
          requestIdleCallback(() => {
            // Process all queued messages in one batch
            if (messageQueue.length > 0) {
              self.postMessage({ 
                type: 'batch', 
                messages: messageQueue.splice(0) 
              });
            }
            processingQueue = false;
          });
        }
      }
    };
  }
};
