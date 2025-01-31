let driverLocationQueue = [];

self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();  // Forzar la activación del Service Worker inmediatamente
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'send-location') {
        event.waitUntil(syncLocationData());
    }
});

async function syncLocationData() {
    // Si hay ubicaciones pendientes en la cola, las enviamos
    while (driverLocationQueue.length > 0) {
        const locationData = driverLocationQueue.shift();

        // Realizamos la solicitud al servidor
        await fetch("https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locationData),
        }).catch((error) => {
            console.error("Error al enviar la ubicación:", error);
        });
    }
}

function addLocationToQueue(driverId, status, lat, lng) {
    driverLocationQueue.push({
        driverId,
        status,
        lat,
        lng,
    });

    // Intentar sincronizar de inmediato
    if ('sync' in self.registration) {
        self.registration.sync.register('send-location');
    }
}
