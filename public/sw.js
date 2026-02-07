const CACHE_NAME = `amici-di-boyle-v${Date.now()}`;
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/attached_assets/logo_1750341628716.jpg',
  '/attached_assets/IMG_20250619_160926_1750342241935.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - Standard strategy without cache busting to prevent Google Search Console issues
self.addEventListener('fetch', (event) => {
  // Standard fetch for all requests - no redirects, no cache busting
  // This prevents "Pagina con reindirizzamento" errors in Google Search Console
  event.respondWith(fetch(event.request));
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nuovo aggiornamento disponibile',
    icon: '/attached_assets/logo_1750341628716.jpg',
    badge: '/attached_assets/logo_1750341628716.jpg',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Apri'
      },
      {
        action: 'close',
        title: 'Chiudi'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Gli amici di Boyle', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Helper function for syncing contact forms
async function syncContactForm() {
  try {
    // Get pending contact form submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          await removePendingSubmission(submission.id);
        }
      } catch (error) {
        console.log('Failed to sync submission:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingSubmissions() {
  // Implementation would use IndexedDB to store offline submissions
  return [];
}

async function removePendingSubmission(id) {
  // Implementation would remove from IndexedDB
}