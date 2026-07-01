const CACHE_VERSION = 'v1';
const STATIC_CACHE = `rrc-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `rrc-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `rrc-images-${CACHE_VERSION}`;
const API_CACHE = `rrc-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Cache-first for static assets
function isStaticAsset(url) {
  const staticPatterns = [/\.(js|css|woff2?)$/, /\/_next\/static\//];
  return staticPatterns.some((p) => p.test(url));
}

// Network-first for API calls
function isApiCall(url) {
  return url.includes('/api/');
}

// Cache-first for images
function isImage(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif)$/.test(url);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.startsWith('http')) return;

  // Skip auth API calls (never cache sensitive data)
  if (url.includes('/api/auth/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isImage(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 60 * 60 * 24 * 7)); // 7 days
    return;
  }

  if (isApiCall(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Navigation requests - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE).catch(() => {
        return caches.match('/offline');
      })
    );
    return;
  }

  // Everything else - stale while revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

async function cacheFirst(request, cacheName, maxAgeSeconds = null) {
  const cached = await caches.match(request);
  if (cached) {
    if (maxAgeSeconds) {
      const age = Date.now() - new Date(cached.headers.get('date') || 0).getTime();
      if (age > maxAgeSeconds * 1000) {
        // Cache expired, fetch in background
        fetchAndCache(request, cacheName);
      }
    }
    return cached;
  }
  return fetchAndCache(request, cacheName);
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function fetchAndCache(request, cacheName) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Order update from RrcKitchen',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/',
      },
      actions: data.actions || [
        { action: 'view', title: 'View Order' },
        { action: 'close', title: 'Dismiss' },
      ],
    };
    event.waitUntil(self.registration.showNotification(data.title || 'Order Update', options));
  } catch (e) {
    // silent fail
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
