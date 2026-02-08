/**
 * Service Worker ottimizzato per performance avanzate
 * Versione: 2.0 - Ottimizzazioni Core Web Vitals
 */

const CACHE_VERSION = '2.0';
const CRITICAL_CACHE = `critical-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Risorse critiche per First Paint veloce
const CRITICAL_RESOURCES = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff2',
  '/node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2'
];

// Risorse statiche con cache lunga
const STATIC_RESOURCES = [
  '/manifest.json',
  '/attached_assets/logo_1750341628716.jpg'
];

// Strategie di cache
const CACHE_STRATEGIES = {
  // Network First per API (dati sempre aggiornati)
  api: 'networkFirst',
  // Cache First per immagini e font (risorse statiche)
  static: 'cacheFirst', 
  // Stale While Revalidate per pagine (velocità + aggiornamenti)
  pages: 'staleWhileRevalidate'
};

// Install - Precarica risorse critiche
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critico per LCP veloce
      caches.open(CRITICAL_CACHE).then(cache => 
        cache.addAll(CRITICAL_RESOURCES)
      ),
      // Cache statico
      caches.open(STATIC_CACHE).then(cache => 
        cache.addAll(STATIC_RESOURCES)
      )
    ]).then(() => {
      self.skipWaiting(); // Attiva immediatamente
    })
  );
});

// Activate - Pulizia cache vecchie
self.addEventListener('activate', (event) => {
  const currentCaches = [CRITICAL_CACHE, STATIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch - Strategie ottimizzate per tipo di risorsa
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // Immagini - Cache First con fallback
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
  
  // Font - Cache First
  if (request.url.includes('.woff2') || request.url.includes('font')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // CSS/JS - Stale While Revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }
  
  // Pagine HTML - Stale While Revalidate
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request, CRITICAL_CACHE));
    return;
  }
  
  // Default - Network con fallback cache
  event.respondWith(
    fetch(request).catch(() => 
      caches.match(request)
    )
  );
});

// Network First Strategy - Per dati freschi
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    // Network failed, try cache
  }
  
  return caches.match(request) || new Response('Offline', { status: 503 });
}

// Cache First Strategy - Per risorse statiche
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.warn('Cache first failed:', error);
  }
  
  return new Response('Resource not available', { status: 404 });
}

// Stale While Revalidate - Per performance ottimale
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Fetch in background per aggiornare cache
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  
  // Restituisci cache se disponibile, altrimenti aspetta network
  return cachedResponse || fetchPromise;
}

// Background Sync per form offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Implementa sync form quando offline
    const pendingForms = await self.registration.sync.getTags();
    // Process pending forms...
    console.log('Syncing contact forms:', pendingForms);
  } catch (error) {
    console.error('Form sync failed:', error);
  }
}

// Preload strategico per componenti lazy
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_ROUTE') {
    const { route } = event.data;
    preloadRoute(route);
  }
});

async function preloadRoute(route) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.add(route);
  } catch (error) {
    console.warn('Preload failed for:', route, error);
  }
}