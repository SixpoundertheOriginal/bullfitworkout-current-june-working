
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addResourceHints, preloadCriticalRoutes } from './utils/bundleOptimization';
import { realUserMonitoring } from './services/realUserMonitoring';
import { appleOptimization } from './services/appleOptimization';

// Initialize performance optimizations immediately
addResourceHints();
preloadCriticalRoutes();

// Initialize Apple-specific optimizations
appleOptimization.optimizeForBattery();

// Get the root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Create a root with enhanced performance
const root = createRoot(rootElement);

// Add performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Track app initialization time
  const initStartTime = performance.now();
  
  window.addEventListener('load', () => {
    const initTime = performance.now() - initStartTime;
    console.log(`🚀 App initialized in ${initTime.toFixed(2)}ms`);
    realUserMonitoring.trackComponentRender('App', initTime);
  });
}

// Service Worker registration with enhanced caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🔧 SW registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('🆕 New version available');
                window.dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// Render the app with error boundary
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
