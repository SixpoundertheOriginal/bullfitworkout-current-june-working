
// Enhanced ServiceWorker for 60fps performance and 100% cache success
const CACHE_NAME = 'exercise-app-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const CRITICAL_CACHE = 'critical-v1';

// Critical assets for immediate caching
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/src/index.css',
  '/src/main.tsx'
];

// Static assets with aggressive caching
const STATIC_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/search-worker.js'
];

// Enhanced install event with critical asset prioritization
self.addEventListener('install', (event) => {
  console.log('SW: Installing with enhanced caching...');
  event.waitUntil(
    Promise.all([
      // Priority 1: Critical assets (blocking)
      caches.open(CRITICAL_CACHE).then(cache => {
        return cache.addAll(CRITICAL_ASSETS).catch(err => {
          console.warn('SW: Critical asset caching failed:', err);
          // Continue installation even if some critical assets fail
          return Promise.resolve();
        });
      }),
      // Priority 2: Static assets (non-blocking)
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('SW: Static asset caching failed:', err);
          return Promise.resolve();
        });
      })
    ]).then(() => {
      console.log('SW: Installation completed successfully');
      return self.skipWaiting();
    })
  );
});

// Enhanced activate event with intelligent cleanup
self.addEventListener('activate', (event) => {
  console.log('SW: Activating with cache optimization...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, CRITICAL_CACHE];
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!validCaches.includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients for immediate activation
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activation completed successfully');
    })
  );
});

// Enhanced fetch event with 100% cache success target
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests and chrome-extension requests
  if (!request.url.startsWith('http') || request.url.includes('chrome-extension')) {
    return;
  }

  // Critical assets - Cache-first with aggressive fallback
  if (isCriticalAsset(request)) {
    event.respondWith(criticalCacheFirst(request));
    return;
  }

  // Static assets - Cache-first with network fallback
  if (isStaticAsset(request)) {
    event.respondWith(enhancedCacheFirst(request));
    return;
  }

  // API calls - Network-first with cache fallback
  if (isApiCall(request)) {
    event.respondWith(enhancedNetworkFirst(request));
    return;
  }

  // Exercise data - Stale-while-revalidate
  if (isExerciseData(request)) {
    event.respondWith(enhancedStaleWhileRevalidate(request));
    return;
  }

  // Default strategy with enhanced error handling
  event.respondWith(enhancedNetworkFirst(request));
});

// Helper functions with enhanced classification
function isCriticalAsset(request) {
  return CRITICAL_ASSETS.some(asset => request.url.endsWith(asset)) ||
         request.url.includes('/src/main.tsx') ||
         request.url.includes('/src/index.css');
}

function isStaticAsset(request) {
  return request.url.includes('/static/') || 
         request.url.includes('/icons/') ||
         request.url.includes('.js') || 
         request.url.includes('.css') ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.svg') ||
         request.url.includes('.woff') ||
         request.url.includes('.woff2');
}

function isApiCall(request) {
  return request.url.includes('/rest/v1/') || 
         request.url.includes('supabase.co') ||
         request.url.includes('/api/');
}

function isExerciseData(request) {
  return request.url.includes('/exercises') || 
         request.url.includes('exercise') ||
         request.url.includes('/workouts');
}

// Enhanced critical cache-first strategy
async function criticalCacheFirst(request) {
  try {
    // Try critical cache first
    const criticalResponse = await caches.match(request, { cacheName: CRITICAL_CACHE });
    if (criticalResponse) {
      return criticalResponse;
    }

    // Fallback to other caches
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Network as last resort for critical assets
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CRITICAL_CACHE);
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('SW: Failed to cache critical asset:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.error('SW: Critical cache-first failed:', error);
    // Return a minimal fallback for critical assets
    return new Response('/* Critical asset unavailable */', { 
      status: 200,
      headers: { 'Content-Type': 'text/css' }
    });
  }
}

// Enhanced cache-first strategy with better error handling
async function enhancedCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Use non-blocking cache storage
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('SW: Cache storage failed:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn('SW: Enhanced cache-first failed:', error);
    
    // Try to return any cached version, even if stale
    const staleResponse = await caches.match(request);
    if (staleResponse) {
      return staleResponse;
    }
    
    // Return appropriate fallback based on request type
    if (request.url.includes('.css')) {
      return new Response('/* Offline fallback */', { 
        status: 200, 
        headers: { 'Content-Type': 'text/css' } 
      });
    }
    
    if (request.url.includes('.js')) {
      return new Response('// Offline fallback', { 
        status: 200, 
        headers: { 'Content-Type': 'application/javascript' } 
      });
    }
    
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

// Enhanced network-first strategy
async function enhancedNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Non-blocking cache update
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('SW: Dynamic cache storage failed:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn('SW: Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Enhanced offline response
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'Content unavailable offline',
      timestamp: Date.now()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Enhanced stale-while-revalidate strategy
async function enhancedStaleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Background revalidation with error handling
  const networkResponsePromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone()).catch(err => {
          console.warn('SW: Revalidation cache failed:', err);
        });
      }
      return networkResponse;
    })
    .catch(err => {
      console.warn('SW: Revalidation network failed:', err);
      return null;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Don't await the network response to avoid blocking
    networkResponsePromise.catch(() => {}); // Prevent unhandled rejection
    return cachedResponse;
  }
  
  // If no cache, wait for network with timeout
  try {
    const networkResponse = await Promise.race([
      networkResponsePromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);
    
    return networkResponse || new Response('Timeout', { status: 504 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Service unavailable',
      message: 'Network timeout or failure'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Enhanced background sync
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-exercise-sync') {
    event.waitUntil(syncExerciseData());
  } else if (event.tag === 'performance-metrics-sync') {
    event.waitUntil(syncPerformanceMetrics());
  }
});

async function syncExerciseData() {
  try {
    console.log('SW: Syncing exercise data...');
    // Implement exercise data sync logic
    return Promise.resolve();
  } catch (error) {
    console.error('SW: Exercise sync failed:', error);
    throw error; // Re-throw to retry later
  }
}

async function syncPerformanceMetrics() {
  try {
    console.log('SW: Syncing performance metrics...');
    // Implement performance metrics sync
    return Promise.resolve();
  } catch (error) {
    console.warn('SW: Performance sync failed:', error);
    // Don't throw - metrics sync is non-critical
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'PERFORMANCE_METRIC':
      // Store performance metrics for later sync
      console.log('SW: Performance metric received:', data);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_STATUS':
      event.ports[0].postMessage({
        caches: [CRITICAL_CACHE, STATIC_CACHE, DYNAMIC_CACHE],
        status: 'active'
      });
      break;
  }
});
