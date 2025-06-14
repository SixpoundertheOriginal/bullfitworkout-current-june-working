
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addResourceHints, preloadCriticalRoutes } from './utils/bundleOptimization';
import { appleOptimization } from './services/appleOptimization';
import { GlobalProviders } from '@/providers/GlobalProviders'; // Updated import

// Essential performance optimizations only
addResourceHints();
appleOptimization.optimizeForBattery();

// Non-blocking preloads
requestAnimationFrame(() => {
  preloadCriticalRoutes();
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement, {
  identifierPrefix: 'bullfit-'
});

// Essential service worker registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none'
      });
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}

root.render(
  <React.StrictMode>
    <GlobalProviders> {/* Replaced AppProviders with GlobalProviders */}
      <App />
    </GlobalProviders>
  </React.StrictMode>
);

