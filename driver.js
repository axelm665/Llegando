const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let worker = null;
let currentStatus = "Inactivo";
let driverId = "";

// 🟢 Activar Web Worker para rastreo de ubicación
function startWorker() {
    if (worker === null) {
        worker = new Worker("location-worker.js");
        worker.onmessage = function (event) {
            sendLocation(event.data);
        };
    }
}

// 🔴 Detener Web Worker cuando el conductor se desactiva
function stopWorker() {
    if (worker !== null) {
        worker.postMessage({ command: "stop" });
        worker.terminate();
        worker = null;
    }
}

// 🌍 Enviar ubicación al webhook
function sendLocation(locationData) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData)
    }).catch(() => {
        saveLocationOffline(locationData);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.sync.register('sync-location');
            });
        }
    });
}

// 🚀 Activar estado de conductor y comenzar el rastreo
function setDriverStatus(status) {
    driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    if (status === "Activo") {
        startWorker(); // Inicia el Web Worker
    } else {
        stopWorker(); // Detiene el Web Worker
    }

    updateStatus(status);
}

// 🔥 Guardar ubicación offline si falla el envío
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
        store.add(locationData);
    };
}

// 🟡 Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/Llegando/service-worker.js')
        .then(reg => console.log('Service Worker registrado:', reg.scope))
        .catch(error => console.log('Error al registrar Service Worker:', error));
}
