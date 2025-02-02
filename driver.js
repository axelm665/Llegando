const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let watchId = null;
let currentStatus = "Inactivo";
let driverId = "";
let wakeLock = null;

// 🟢 Solicitar Wake Lock Persistente
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activado');
            wakeLock.addEventListener('release', () => console.log('Wake Lock liberado'));
        } catch (err) {
            console.error('Error al activar Wake Lock:', err);
        }
    }
}

// 🔵 Mantener Wake Lock si la pestaña se reactiva
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && !wakeLock) {
        await requestWakeLock();
    }
});

// 🚀 Activar estado del conductor
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
        startTracking();
    } else {
        document.getElementById('inactiveBtn').disabled = true;
        document.getElementById('activeBtn').disabled = false;
        document.getElementById('tripEndBtn').disabled = true;
        stopTracking();
    }

    if (status === "Viaje Finalizado") {
        status = "Inactivo";
    }

    updateStatus(status);
    sendStatusUpdate(status);
}

// 🔥 Enviar estado del conductor
function sendStatusUpdate(status) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, status })
    });
}

// 🌍 Obtener ubicación en tiempo real
function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(position => {
            const timestamp = new Date().toLocaleString("en-US", {
                timeZone: "America/Argentina/Buenos_Aires",
                hour12: false
            });

            const locationData = {
                driverId,
                status: currentStatus,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp
            };

            sendLocation(locationData);
        }, error => console.error("Error obteniendo ubicación:", error), {
            enableHighAccuracy: true,
            maximumAge: 10000
        });
    }
}

// ⛔ Detener seguimiento de ubicación
function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    if (wakeLock) {
        wakeLock.release().then(() => {
            wakeLock = null;
        });
    }
}

// 🔄 Enviar ubicación o guardarla en IndexedDB si falla
function sendLocation(data) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).catch(() => {
        saveLocationOffline(data);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.sync.register('sync-location');
            });
        }
    });
}

// 🔥 Guardar ubicación en IndexedDB para enviar más tarde
function saveLocationOffline(data) {
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
        store.add(data);
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
