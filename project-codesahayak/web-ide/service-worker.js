// CodeSahayak Service Worker
// Provides basic caching for better performance

const CACHE_NAME = 'codesahayak-v1';
const urlsToCache = [
  '/app.html',
  '/js/utils.js',
  '/js/language.js',
  '/js/api.js',
  '/locales/en.json',
  '/locales/hi.json',
  '/locales/ta.json',
  '/locales/bn.json',
  '/locales/mr.json',
  '/locales/te.json',
  '/locales/gu.json',
  '/locales/kn.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('CodeSahayak: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('CodeSahayak: Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return a basic offline page
        if (event.request.destination === 'document') {
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>CodeSahayak - Offline</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .offline { color: #666; }
              </style>
            </head>
            <body>
              <h1>CodeSahayak</h1>
              <p class="offline">You're currently offline. Please check your internet connection.</p>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('CodeSahayak: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});