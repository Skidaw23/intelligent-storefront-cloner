/**
 * Royal Equips Service Worker
 * Advanced caching strategy for optimal performance
 */

const CACHE_NAME = 'royal-equips-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Resources to cache immediately
const PRECACHE_RESOURCES = [
  '/',
  '/collections/all',
  '/cart',
  '/search',
  OFFLINE_URL
];

// Cache configuration
const CACHE_CONFIG = {
  // Static assets - cache first
  assets: {
    pattern: /\.(css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100
  },
  
  // API requests - network first with fallback
  api: {
    pattern: /\/api\/|\.json$/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50
  },
  
  // Pages - stale while revalidate
  pages: {
    pattern: /\/(?!api|assets)/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 30
  }
};

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('🚗 Royal Equips SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Royal Equips SW: Precaching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
      .catch(error => console.error('❌ SW Install failed:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Royal Equips SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('🗑️ Royal Equips SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
      .catch(error => console.error('❌ SW Activation failed:', error))
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  
  // Determine cache strategy
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch(error => {
        console.error('❌ SW Fetch failed:', error);
        return handleOffline(request);
      })
  );
});

// Determine appropriate cache strategy
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Check each cache configuration
  for (const [name, config] of Object.entries(CACHE_CONFIG)) {
    if (config.pattern.test(pathname)) {
      return { name, ...config };
    }
  }
  
  // Default strategy
  return {
    name: 'default',
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 20
  };
}

// Handle request based on strategy
async function handleRequest(request, strategyConfig) {
  const { strategy, maxAge, maxEntries } = strategyConfig;
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, maxAge, maxEntries);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, maxAge, maxEntries);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, maxAge, maxEntries);
    
    default:
      return fetch(request);
  }
}

// Cache first strategy
async function cacheFirst(request, maxAge, maxEntries) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const dateHeader = cachedResponse.headers.get('date');
    const cachedDate = new Date(dateHeader).getTime();
    const now = Date.now();
    
    if (now - cachedDate < maxAge) {
      return cachedResponse;
    }
  }
  
  // Fetch from network and cache
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cacheResponse(cache, request, response.clone(), maxEntries);
    }
    return response;
  } catch {
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, maxAge, maxEntries) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cacheResponse(cache, request, response.clone(), maxEntries);
    }
    return response;
  } catch {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, maxAge, maxEntries) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Always fetch in background to update cache
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.status === 200) {
        cacheResponse(cache, request, response.clone(), maxEntries);
      }
      return response;
    })
    .catch(error => {
      console.warn('Background fetch failed:', error);
      return null;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  return fetchPromise || new Response('Offline', { status: 503 });
}

// Cache response with size management
async function cacheResponse(cache, request, response, maxEntries) {
  // Manage cache size
  const keys = await cache.keys();
  if (keys.length >= maxEntries) {
    // Remove oldest entries
    const entriesToRemove = keys.slice(0, keys.length - maxEntries + 1);
    await Promise.all(entriesToRemove.map(key => cache.delete(key)));
  }
  
  // Add timestamp header
  const responseWithTimestamp = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      'date': new Date().toISOString()
    }
  });
  
  await cache.put(request, responseWithTimestamp);
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_URL);
    return offlinePage || new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // Return generic offline response for other requests
  return new Response('Offline', { status: 503 });
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'royal-form-sync') {
    event.waitUntil(syncFormData());
  }
});

async function syncFormData() {
  // Handle queued form submissions when back online
  const db = await openDB();
  const formData = await db.getAll('pendingForms');
  
  for (const form of formData) {
    try {
      await fetch(form.url, {
        method: form.method,
        body: form.data,
        headers: form.headers
      });
      
      // Remove from queue on success
      await db.delete('pendingForms', form.id);
    } catch (error) {
      console.error('Form sync failed:', error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Royal Equips',
    icon: '/android-chrome-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Royal Equips', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Simple IndexedDB helper (for form sync)
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RoyalEquipsDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingForms')) {
        db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}