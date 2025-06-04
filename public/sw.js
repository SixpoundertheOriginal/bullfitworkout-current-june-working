
// ServiceWorker for exercise app caching and offline support
const CACHE_NAME = 'exercise-app-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/search-worker.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Cache-first strategy for static assets
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first strategy for API calls
  if (isApiCall(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stale-while-revalidate for exercise data
  if (isExerciseData(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default to network first
  event.respondWith(networkFirst(request));
});

// Helper functions for request classification
function isStaticAsset(request) {
  return request.url.includes('/static/') || 
         request.url.includes('.js') || 
         request.url.includes('.css') ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.svg');
}

function isApiCall(request) {
  return request.url.includes('/rest/v1/') || 
         request.url.includes('supabase.co');
}

function isExerciseData(request) {
  return request.url.includes('/exercises') || 
         request.url.includes('exercise');
}

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache-first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'Content unavailable offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached version immediately, update in background
  if (cachedResponse) {
    networkResponsePromise.catch(() => {}); // Prevent unhandled rejection
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return networkResponsePromise || new Response('Offline', { status: 503 });
}

// Background sync for offline resilience
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-exercise-sync') {
    event.waitUntil(syncExerciseData());
  }
});

async function syncExerciseData() {
  try {
    // Implement background sync logic here
    console.log('Background sync for exercise data');
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}
