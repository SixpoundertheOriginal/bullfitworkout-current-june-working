
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addResourceHints, preloadCriticalRoutes } from './utils/bundleOptimization';
import { realUserMonitoring } from './services/realUserMonitoring';
import { appleOptimization } from './services/appleOptimization';

// Critical performance optimizations - execute immediately
const performanceStart = performance.now();

// Phase 1: Immediate critical optimizations
addResourceHints();
appleOptimization.optimizeForBattery();

// Phase 2: Non-blocking preloads
requestAnimationFrame(() => {
  preloadCriticalRoutes();
});

// Get the root element with error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found - critical application error');
}

// Create root with optimizations
const root = createRoot(rootElement, {
  // Enable concurrent features for better performance
  identifierPrefix: 'bullfit-'
});

// Enhanced service worker registration for cache optimization
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('✅ SW registered successfully');
      
      // Handle service worker updates aggressively
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New SW version available');
              // Auto-update for performance improvements
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // Monitor cache performance
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_PERFORMANCE') {
          realUserMonitoring.trackComponentRender('ServiceWorker', event.data.duration);
        }
      });

    } catch (error) {
      console.error('❌ SW registration failed:', error);
      // Continue without SW - don't block the app
    }
  });
}

// Performance monitoring with frame rate targeting
if (process.env.NODE_ENV === 'production') {
  let frameCount = 0;
  let lastFrameTime = performanceStart;
  
  const monitorFrameRate = () => {
    frameCount++;
    const currentTime = performance.now();
    
    // Report every 60 frames (1 second at 60fps)
    if (frameCount >= 60) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
      
      if (fps < 58) { // Allow 2fps tolerance
        console.warn(`⚠️ Frame rate below target: ${fps}fps`);
        realUserMonitoring.trackComponentRender('FrameRate', 60 - fps);
      }
      
      frameCount = 0;
      lastFrameTime = currentTime;
    }
    
    requestAnimationFrame(monitorFrameRate);
  };
  
  // Start frame rate monitoring
  requestAnimationFrame(monitorFrameRate);
  
  // Track initialization performance
  window.addEventListener('load', () => {
    const initTime = performance.now() - performanceStart;
    console.log(`🚀 App initialized in ${initTime.toFixed(2)}ms`);
    
    // Target: <200ms TTFB equivalent
    if (initTime > 200) {
      console.warn('⚠️ Initialization time exceeded target');
    }
    
    realUserMonitoring.trackComponentRender('AppInit', initTime);
  });
}

// Enhanced error boundaries for performance issues
const originalConsoleError = console.error;
console.error = (...args) => {
  // Track performance-related errors
  const errorMessage = args.join(' ');
  if (errorMessage.includes('frame') || errorMessage.includes('performance')) {
    realUserMonitoring.trackComponentRender('PerformanceError', 1);
  }
  originalConsoleError.apply(console, args);
};

// Render with performance monitoring
const renderStart = performance.now();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Track render completion
requestAnimationFrame(() => {
  const renderTime = performance.now() - renderStart;
  console.log(`🎨 Initial render completed in ${renderTime.toFixed(2)}ms`);
  
  if (renderTime > 16.67) {
    console.warn('⚠️ Initial render exceeded 60fps target');
  }
  
  realUserMonitoring.trackComponentRender('InitialRender', renderTime);
});

// Memory pressure monitoring for frame rate correlation
if ('memory' in performance) {
  setInterval(() => {
    const memInfo = (performance as any).memory;
    const usageMB = memInfo.usedJSHeapSize / 1024 / 1024;
    
    // Warn if memory usage might affect frame rate
    if (usageMB > 150) {
      console.warn(`🧠 High memory usage detected: ${usageMB.toFixed(1)}MB`);
      realUserMonitoring.trackComponentRender('MemoryPressure', usageMB);
    }
  }, 30000); // Check every 30 seconds
}
