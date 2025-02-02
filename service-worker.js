const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// 🔄 Reintentar ubicación en segundo plano si hay fallo de red
async function getSavedLocations() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('locationDB', 1);
        request.onsuccess = event => {
            let db = event.target.result;
            let transaction = db.transaction('locations', 'readonly');
            let store = transaction.objectStore('locations');
            let getAllRequest = store.getAll();
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = reject;
        };
        request.onerror = reject;
    });
}

self.addEventListener('sync', async event => {
    if (event.tag === 'sync-location') {
        event.waitUntil(
            getSavedLocations().then(locations => {
                return Promise.all(locations.map(location => {
                    return fetch(WEBHOOK_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(location) // Enviar la ubicación con el timestamp
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Error al enviar ubicación');
                        }
                        console.log('Ubicación enviada en sync:', location);
                    });
                }));
            }).catch(err => console.error('Fallo en sync-location', err))
        );
    }
});
