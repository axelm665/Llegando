const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;
let currentStatus = "Inactivo";
let driverId = "";
let wakeLock = null;

// 🟢 Solicitar Wake Lock (mantiene el script activo)
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

// 🔵 Monitorear si la pestaña vuelve a estar activa y reactivar Wake Lock
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

// 🌍 Enviar ubicación del conductor
function sendLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const timestamp = new Date().toISOString(); // Obtener el timestamp

            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    driverId,
                    status: currentStatus,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp // Agregar el timestamp
                })
            }).catch(() => {
                // Si falla el envío, guardar la ubicación en IndexedDB
                saveLocationOffline(driverId, currentStatus, position.coords.latitude, position.coords.longitude, timestamp);
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

// 🚪 Detectar cierre de página y enviar "Desconectado"
window.addEventListener("beforeunload", () => {
    if (driverId && currentStatus === "Activo") {
        navigator.sendBeacon(WEBHOOK_URL, JSON.stringify({
            driverId,
            status: "Desconectado"
        }));
    }
    stopLocationUpdates();
});

// 🟡 Actualizar UI según estado
function updateStatus(status) {
    currentStatus = status;
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const activeBtn = document.getElementById('activeBtn');
    const inactiveBtn = document.getElementById('inactiveBtn');
    const tripEndBtn = document.getElementById('tripEndBtn');

    if (status === "Activo") {
        statusText.textContent = "Activo";
        statusIndicator.style.backgroundColor = "green";
        activeBtn.disabled = true;
        inactiveBtn.disabled = false;
        tripEndBtn.disabled = true;
    } else if (status === "Inactivo") {
        statusText.textContent = "Inactivo";
        statusIndicator.style.backgroundColor = "red";
        activeBtn.disabled = false;
        inactiveBtn.disabled = true;
        tripEndBtn.disabled = true;
    } else if (status === "En viaje") {
        statusText.textContent = "En viaje";
        statusIndicator.style.backgroundColor = "blue";
        activeBtn.disabled = true;
        inactiveBtn.disabled = true;
        tripEndBtn.disabled = false;
    } else if (status === "Viaje Finalizado") {
        statusText.textContent = "Inactivo";
        statusIndicator.style.backgroundColor = "red";
        activeBtn.disabled = false;
        inactiveBtn.disabled = true;
        tripEndBtn.disabled = true;
    }
}

// 🔥 Guardar ubicación cuando no se puede enviar
function saveLocationOffline(driverId, status, lat, lng, timestamp) {
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
        store.add({ driverId, status, lat, lng, timestamp }); // Guardar también el timestamp
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
