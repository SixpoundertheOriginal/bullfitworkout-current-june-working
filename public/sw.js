
// Optimized ServiceWorker for performance
const CACHE_NAME = 'bullfit-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

// Essential assets for caching
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/src/index.css'
];

const STATIC_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event with essential caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => 
        cache.addAll(CRITICAL_ASSETS.concat(STATIC_ASSETS)).catch(() => Promise.resolve())
      )
    ]).then(() => self.skipWaiting())
  );
});

// Activate event with cache cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!validCaches.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Optimized fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (!request.url.startsWith('http')) {
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API calls - Network first
  if (isApiCall(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default strategy
  event.respondWith(networkFirst(request));
});

function isStaticAsset(request) {
  return request.url.includes('/static/') || 
         request.url.includes('/icons/') ||
         request.url.includes('.js') || 
         request.url.includes('.css') ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.svg');
}

function isApiCall(request) {
  return request.url.includes('/rest/v1/') || 
         request.url.includes('supabase.co') ||
         request.url.includes('/api/');
}

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Resource unavailable', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'Content unavailable offline'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Message handling
self.addEventListener('message', (event) => {
  const { type } = event.data;
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
