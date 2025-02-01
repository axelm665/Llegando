const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// 🔄 Reintentar ubicación en segundo plano si hay fallo de red
self.addEventListener('sync', event => {
    if (event.tag === 'sync-location') {
        event.waitUntil(
            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    driverId: "UNKNOWN",  // Aquí puedes almacenar el ID del conductor si es necesario
                    status: "Activo",
                    lat: 0, // Reemplazar con última ubicación conocida
                    lng: 0  // Reemplazar con última ubicación conocida
                })
            }).catch(err => console.error('Sync de ubicación falló', err))
        );
    }
});

// 🟢 Solicitar Wake Lock (mantiene el script activo)
self.addEventListener('wakeLock', async () => {
    if ('wakeLock' in navigator) {
        try {
            await navigator.wakeLock.request('screen');
            console.log('Wake Lock activado');
        } catch (err) {
            console.error('Error al activar Wake Lock:', err);
        }
    }
});
