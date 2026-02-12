/**
 * Enhanced Service Worker for CodeSahayak
 * Comprehensive offline functionality with intelligent caching strategies
 */

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAMES = {
    static: `codesahayak-static-${CACHE_VERSION}`,
    dynamic: `codesahayak-dynamic-${CACHE_VERSION}`,
    api: `codesahayak-api-${CACHE_VERSION}`,
    fonts: `codesahayak-fonts-${CACHE_VERSION}`,
    images: `codesahayak-images-${CACHE_VERSION}`
};

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/dashboard.html',
    '/ide-offline.html',
    '/css/design-system.css',
    '/css/advanced-design-system.css',
    '/js/core.js',
    '/js/api-enhanced.js',
    '/js/language.js',
    '/js/utils.js',
    '/js/analytics.js',
    '/js/components/auth.js',
    '/js/components/dashboard.js',
    '/js/components/ide.js',
    '/offline-explanations.json',
    '/locales/en.json',
    '/locales/hi.json',
    '/locales/ta.json',
    '/locales/bn.json',
    '/locales/mr.json',
    '/locales/te.json',
    '/locales/gu.json',
    '/locales/kn.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/auth\/me/,
    /\/api\/progress\/stats/,
    /\/api\/code\/mine/,
    /\/api\/ai\/explain/,
    /\/api\/ai\/hint/
];

// ============================================================================
// INSTALL EVENT - Cache static assets
// ============================================================================

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAMES.static)
            .then(cache => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[ServiceWorker] Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('[ServiceWorker] Installation failed:', error);
            })
    );
});

// ============================================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================================

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches
                        if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// ============================================================================
// FETCH EVENT - Intelligent caching strategies
// ============================================================================

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Apply appropriate caching strategy
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    } else if (isAPIRequest(url)) {
        event.respondWith(networkFirst(request, CACHE_NAMES.api));
    } else if (isFontRequest(url)) {
        event.respondWith(cacheFirst(request, CACHE_NAMES.fonts));
    } else if (isImageRequest(url)) {
        event.respondWith(cacheFirst(request, CACHE_NAMES.images));
    } else {
        event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.dynamic));
    }
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 * Best for: Static assets, fonts, images
 */
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }

        const response = await fetch(request);
        
        if (response.ok) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[ServiceWorker] Cache first failed:', error);
        return offlineFallback(request);
    }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 * Best for: API requests, dynamic content
 */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[ServiceWorker] Network failed, trying cache:', request.url);
        
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        return offlineFallback(request);
    }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 * Best for: Frequently updated content
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);
    
    return cached || fetchPromise;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isStaticAsset(url) {
    return url.pathname.match(/\.(js|css|html)$/) ||
           STATIC_ASSETS.some(asset => url.pathname.endsWith(asset));
}

function isAPIRequest(url) {
    return url.pathname.startsWith('/api/');
}

function isFontRequest(url) {
    return url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/);
}

function isImageRequest(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
}

function offlineFallback(request) {
    const url = new URL(request.url);
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
        return caches.match('/ide-offline.html');
    }
    
    // Return offline JSON for API requests
    if (isAPIRequest(url)) {
        return new Response(
            JSON.stringify({
                offline: true,
                message: 'You are offline. Changes will be synced when connection is restored.'
            }),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
    
    // Return generic offline response
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', event => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'sync-offline-queue') {
        event.waitUntil(syncOfflineQueue());
    }
});

async function syncOfflineQueue() {
    try {
        // Get offline queue from IndexedDB or localStorage
        const clients = await self.clients.matchAll();
        
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_QUEUE',
                message: 'Syncing offline actions...'
            });
        });
        
        console.log('[ServiceWorker] Offline queue synced');
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
    }
}

// ============================================================================
// PUSH NOTIFICATIONS (Future feature)
// ============================================================================

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'New notification from CodeSahayak',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'CodeSahayak', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', event => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAMES.dynamic).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

console.log('[ServiceWorker] Service Worker loaded');
