
// Critical resource hints for performance optimization
export function addResourceHints() {
  const head = document.head;
  
  // Preconnect to critical origins
  const origins = [
    'https://oglcdlzomfuoyeqeobal.supabase.co',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  origins.forEach(origin => {
    if (!document.querySelector(`link[href="${origin}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = '';
      head.appendChild(link);
    }
  });

  // DNS prefetch for additional performance
  const dnsOrigins = [
    'https://cdn.gpteng.co',
    'https://lovable.dev'
  ];

  dnsOrigins.forEach(origin => {
    if (!document.querySelector(`link[href="${origin}"][rel="dns-prefetch"]`)) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = origin;
      head.appendChild(link);
    }
  });
}

// Preload critical routes for better navigation performance
export function preloadCriticalRoutes() {
  const criticalRoutes = [
    '/training',
    '/exercises',
    '/progress'
  ];

  criticalRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
}

// Optimize images with lazy loading and proper sizing
export function optimizeImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const element = img as HTMLImageElement;
      if (element.dataset.src) {
        element.src = element.dataset.src;
      }
    });
  }
}

// Monitor bundle size and performance
export function monitorBundlePerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Monitor JavaScript bundle sizes
          if (resource.name.includes('.js') && resource.transferSize) {
            const sizeKB = resource.transferSize / 1024;
            if (sizeKB > 250) { // 250KB threshold
              console.warn(`⚠️ Large bundle detected: ${resource.name} (${sizeKB.toFixed(2)}KB)`);
            }
          }
          
          // Monitor slow resource loading
          if (resource.duration > 1000) {
            console.warn(`⚠️ Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource performance monitoring not supported');
    }
  }
}

// Critical CSS inlining utility
export function inlineCriticalCSS() {
  const criticalCSS = `
    /* Critical above-the-fold styles */
    body { 
      margin: 0; 
      font-family: Inter, system-ui, sans-serif; 
      background: #111827; 
      color: #fff; 
    }
    #root { 
      min-height: 100vh; 
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
}
