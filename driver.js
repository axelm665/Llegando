const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;
let currentStatus = "Inactivo";
let driverId = "";
let wakeLock = null;

// 🟢 Activar Wake Lock para mantener la pantalla activa
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activado');
        } catch (err) {
            console.error('Error al activar Wake Lock:', err);
        }
    }
}

// 🔵 Detectar si la pestaña vuelve a estar activa y reactivar Wake Lock
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && wakeLock === null) {
        await requestWakeLock();
    }
});

// 🚀 Activar estado de conductor
function setDriverStatus(status) {
    driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    if (status === "Activo") {
        document.getElementById('activeBtn').disabled = true;
        document.getElementById('inactiveBtn').disabled = false;
        requestWakeLock();
        startLocationUpdates();
    } else {
        document.getElementById('inactiveBtn').disabled = true;
        document.getElementById('activeBtn').disabled = false;
        document.getElementById('tripEndBtn').disabled = true;
        stopLocationUpdates();
    }

    if (status === "Viaje Finalizado") {
        status = "Inactivo";
    }

    updateStatus(status);
    sendStatusUpdate(status);
}

// 🔥 Enviar actualización de estado
function sendStatusUpdate(status) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, status })
    });
}

// 🌍 Enviar ubicación del conductor con timestamp único
function sendLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const timestamp = new Date().toISOString(); // Almacenamos en formato UTC

            const locationData = {
                driverId,
                status: currentStatus,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp // Se guarda el timestamp único en cada registro
            };

            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationData)
            }).catch(() => {
                // Si falla el envío, guardar la ubicación en IndexedDB
                saveLocationOffline(locationData);
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.sync.register('sync-location');
                    });
                }
            });
        }, error => console.error("Error obteniendo ubicación:", error), {
            enableHighAccuracy: true,
            maximumAge: 10000
        });
    }
}

// ⏳ Iniciar envío de ubicación cada 30s
function startLocationUpdates() {
    if (!intervalId) {
        sendLocation(); // Enviar inmediatamente
        intervalId = setInterval(sendLocation, 30000);
    }
}

// ⛔ Detener envío de ubicación
function stopLocationUpdates() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    if (wakeLock) {
        wakeLock.release().then(() => {
            wakeLock = null;
            console.log('Wake Lock liberado');
        });
    }
}

// 🔥 Guardar ubicación cuando no se puede enviar
function saveLocationOffline(locationData) {
    if (!('indexedDB' in window)) return;

    const request = indexedDB.open('locationDB', 1);
    request.onupgradeneeded = event => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains('locations')) {
            db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = event => {
        let db = event.target.result;
        let transaction = db.transaction('locations', 'readwrite');
        let store = transaction.objectStore('locations');
        store.add(locationData); // Guardamos la ubicación con su timestamp original
    };
}

// 🟡 Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/Llegando/service-worker.js')
        .then(reg => {
            console.log('Service Worker registrado:', reg.scope);
        })
        .catch(error => {
            console.log('Error al registrar Service Worker:', error);
        });
}
