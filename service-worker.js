const CACHE_NAME = 'llegando-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/driver.html',
    '/style.css',
    '/driver.js'
];

// Instalación del Service Worker y almacenamiento en caché de los archivos estáticos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cacheando archivos...');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Activación del Service Worker y eliminación de cachés obsoletos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antiguo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Intercepción de solicitudes y respuesta con caché o red
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match('/index.html');
        })
    );
});
