/* ==========================================
   SERVICE WORKER - PWA OFFLINE FUNCTIONALITY
   Cache Strategy: Network First with Cache Fallback
   ========================================== */

const CACHE_NAME = 'redinnova-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style-2026.css',
  '/variables-2026.css',
  '/manifest.json',
  '/auth.js',
  '/script.js',
  '/daily-registry.js',
  '/pdf-download.js',
  '/devoluciones.js',
  '/netlify-client.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Cacheando assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip no-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip requests a dominios externos
  if (url.origin !== location.origin) {
    return;
  }

  // Network First Strategy para documentos HTML
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache First Strategy para assets estáticos
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background Sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncData().then(() => {
        console.log('[ServiceWorker] Sincronización completada');
      })
    );
  }
});

// Función para sincronizar datos
async function syncData() {
  try {
    // Aquí iría la lógica para sincronizar datos pendientes
    console.log('[ServiceWorker] Sincronizando datos...');
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Error sincronizando:', error);
    return Promise.reject(error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Redinnova',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%2306b6d4" width="192" height="192" rx="45"/><text x="96" y="96" font-size="100" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold">R</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%2306b6d4" width="96" height="96" rx="20"/><text x="48" y="48" font-size="50" fill="white" text-anchor="middle" dominant-baseline="middle">R</text></svg>',
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ],
    tag: 'redinnova-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Redinnova', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notificación clickeada:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        // Verificar si ya hay una ventana abierta
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

console.log('[ServiceWorker] Service Worker registrado correctamente');
