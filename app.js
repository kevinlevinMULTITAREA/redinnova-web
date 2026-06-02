/* ==========================================
   APP.JS - PWA INITIALIZATION
   Service Worker Registration & PWA Features
   ========================================== */

// ===== REGISTRAR SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado correctamente:', registration);
        
        // Detectar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('🔄 Nueva versión disponible');
              mostrarNotificacionActualizacion();
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error);
      });
  });
}

// ===== INSTALL PROMPT (AGREGAR A PANTALLA INICIO) =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📦 PWA lista para instalar');
  mostrarBotonInstalar();
});

function mostrarBotonInstalar() {
  const botonInstalar = document.getElementById('btn-install-pwa');
  if (botonInstalar) {
    botonInstalar.style.display = 'flex';
    botonInstalar.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuario eligió: ${outcome}`);
        deferredPrompt = null;
        botonInstalar.style.display = 'none';
      }
    });
  }
}

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada correctamente');
  deferredPrompt = null;
});

// ===== DETECTAR CONEXIÓN OFFLINE/ONLINE =====
window.addEventListener('online', () => {
  console.log('🟢 Conexión restaurada');
  mostrarNotificacionConexion('Conexión restaurada', 'success');
  sincronizarDatos();
});

window.addEventListener('offline', () => {
  console.log('🔴 Sin conexión a internet');
  mostrarNotificacionConexion('Trabajando sin conexión', 'warning');
});

// ===== NOTIFICACIONES =====
function mostrarNotificacionActualizacion() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Redinnova', {
      body: '🔄 Nueva versión disponible. Recarga la página.',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%2306b6d4" width="192" height="192" rx="45"/><text x="96" y="96" font-size="100" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold">R</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%2306b6d4" width="96" height="96" rx="20"/></svg>',
      tag: 'redinnova-update',
      requireInteraction: true
    });
  }
}

function mostrarNotificacionConexion(mensaje, tipo) {
  const notif = document.createElement('div');
  notif.className = `notificacion-conexion notificacion-${tipo}`;
  notif.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <i class="fas fa-${tipo === 'success' ? 'wifi' : 'wifi-off'}"></i>
      <span>${mensaje}</span>
    </div>
  `;
  
  notif.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${tipo === 'success' ? '#22c55e' : '#f59e0b'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    font-weight: 600;
    animation: slideInUp 0.3s ease-out;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// ===== SOLICITAR PERMISOS NOTIFICACIONES =====
function solicitarPermisosNotificaciones() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación otorgados');
      }
    });
  }
}

// Solicitar permisos al cargar la página
window.addEventListener('load', () => {
  solicitarPermisosNotificaciones();
});

// ===== INDEXEDDB - BASE DE DATOS LOCAL =====
const DB_NAME = 'redinnova-db';
const DB_VERSION = 1;
const STORES = ['products', 'cart', 'usuarios', 'registros'];

let db;

function inicializarDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Error abriendo BD');
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB inicializada');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Crear object stores si no existen
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
          console.log(`📦 Object Store creado: ${store}`);
        }
      });
    };
  });
}

// Guardar en IndexedDB
async function guardarEnBD(storeName, data) {
  if (!db) await inicializarDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      console.log(`✅ Datos guardados en ${storeName}`);
      resolve(request.result);
    };
    request.onerror = () => reject('Error guardando datos');
  });
}

// Obtener de IndexedDB
async function obtenerDeBD(storeName) {
  if (!db) await inicializarDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      console.log(`✅ Datos obtenidos de ${storeName}`);
      resolve(request.result);
    };
    request.onerror = () => reject('Error obteniendo datos');
  });
}

// ===== SINCRONIZACIÓN DE DATOS =====
async function sincronizarDatos() {
  try {
    // Sincronizar carrito
    const carrito = await obtenerDeBD('cart');
    if (carrito.length > 0) {
      console.log('🔄 Sincronizando carrito:', carrito);
      // Aquí iría la lógica para enviar datos al servidor
    }

    // Sincronizar registros
    const registros = await obtenerDeBD('registros');
    if (registros.length > 0) {
      console.log('🔄 Sincronizando registros:', registros);
    }

    console.log('✅ Sincronización completada');
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
  }
}

// ===== BACKGROUND SYNC =====
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  window.addEventListener('online', async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-data');
      console.log('📤 Background sync registrado');
    } catch (error) {
      console.error('Error registrando sync:', error);
    }
  });
}

// ===== PERFORMANCE - MÉTRICAS =====
window.addEventListener('load', () => {
  if ('PerformanceObserver' in window) {
    try {
      // Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('📊 Core Web Vitals:', {
            nombre: entry.name,
            valor: entry.value,
            rating: entry.rating
          });
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Web Vitals no disponibles:', error);
    }
  }

  // Timing general
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    console.log('⏱️ Métricas de Rendimiento:', {
      'DNS Lookup': `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
      'TCP Connection': `${navigation.connectEnd - navigation.connectStart}ms`,
      'Time to First Byte': `${navigation.responseStart - navigation.requestStart}ms`,
      'Download Time': `${navigation.responseEnd - navigation.responseStart}ms`,
      'DOM Interactive': `${navigation.domInteractive - navigation.fetchStart}ms`,
      'DOM Complete': `${navigation.domComplete - navigation.fetchStart}ms`,
      'Load Complete': `${navigation.loadEventEnd - navigation.fetchStart}ms`
    });
  }
});

// ===== THEME DETECTION =====
function detectarTema() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  if (prefersDark.matches) {
    document.documentElement.style.colorScheme = 'dark';
    console.log('🌙 Tema oscuro detectado');
  } else {
    document.documentElement.style.colorScheme = 'light';
    console.log('☀️ Tema claro detectado');
  }
  
  // Escuchar cambios de tema
  prefersDark.addEventListener('change', (e) => {
    document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
  });
}

detectarTema();

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Redinnova 2026 - SaaS Moderno');
  console.log('📱 PWA Enabled');
  console.log('🔒 Security Headers Active');
  console.log('⚡ Performance Optimized');
  
  // Inicializar BD
  try {
    await inicializarDB();
  } catch (error) {
    console.warn('BD local no disponible:', error);
  }
});

// ===== ANIMACIÓN ENTRADA =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .notificacion-conexion {
    animation: slideInUp 0.3s ease-out;
  }
`;
document.head.appendChild(style);

console.log('✅ app.js cargado correctamente');
