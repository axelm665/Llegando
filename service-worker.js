const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// 🔄 Obtener ubicaciones guardadas sin modificar timestamps
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

// 🔄 Enviar ubicaciones guardadas cuando haya conexión
self.addEventListener('sync', async event => {
    if (event.tag === 'sync-location') {
        event.waitUntil(
            getSavedLocations().then(locations => {
                return Promise.all(locations.map(location => {
                    return fetch(WEBHOOK_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(location)
                    }).then(response => {
                        if (!response.ok) throw new Error('Error al enviar ubicación');
                        console.log('Ubicación enviada en sync:', location);
                    });
                }));
            }).catch(err => console.error('Fallo en sync-location', err))
        );
    }
});

// 🔄 Periodic Background Sync (Solo en Chrome)
self.addEventListener('periodicsync', async event => {
    if (event.tag === 'sync-location-periodically') {
        console.log('Periodic Background Sync activado');
        event.waitUntil(
            getSavedLocations().then(locations => {
                return Promise.all(locations.map(location => {
                    return fetch(WEBHOOK_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(location)
                    }).then(response => {
                        if (!response.ok) throw new Error('Error al enviar ubicación');
                        console.log('Ubicación enviada en periodic sync:', location);
                    });
                }));
            }).catch(err => console.error('Fallo en periodic sync-location', err))
        );
    }
});
