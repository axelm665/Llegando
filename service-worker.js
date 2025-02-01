self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('llegando-cache-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/driver.html',
                '/style.css',
                '/driver.js'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-location') {
        event.waitUntil(
            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    driverId,
                    status: "Activo",
                    lat: 0, // Se reemplaza con la última ubicación conocida
                    lng: 0
                })
            }).catch(err => console.error('Sync de ubicación falló', err))
        );
    }
});
