const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// 🔄 Función para obtener ubicaciones guardadas en IndexedDB
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

// 🔥 Enviar ubicaciones almacenadas cuando haya conexión
async function sendSavedLocations() {
    const locations = await getSavedLocations();
    
    if (locations.length === 0) return;

    for (const location of locations) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(location)
            });

            if (response.ok) {
                console.log('Ubicación enviada:', location);

                // Borrar ubicación de IndexedDB después de enviarla correctamente
                removeLocationFromDB(location.id);
            } else {
                throw new Error('Error al enviar ubicación');
            }
        } catch (error) {
            console.error('Fallo en envío de ubicación:', error);
        }
    }
}

// 🗑️ Eliminar una ubicación de IndexedDB
function removeLocationFromDB(id) {
    const request = indexedDB.open('locationDB', 1);
    request.onsuccess = event => {
        let db = event.target.result;
        let transaction = db.transaction('locations', 'readwrite');
        let store = transaction.objectStore('locations');
        store.delete(id);
    };
}

// 🔄 Background Sync: Reintentar cuando haya conexión
self.addEventListener('sync', event => {
    if (event.tag === 'sync-location') {
        event.waitUntil(sendSavedLocations());
    }
});
