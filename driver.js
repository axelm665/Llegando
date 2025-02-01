const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;
let currentStatus = "Inactivo";
let driverId = "";
let wakeLock = null;

// Solicitar Wake Lock para evitar que el navegador pause el envío de ubicación
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

// Manejar pérdida del Wake Lock y reintentar activarlo
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && wakeLock === null) {
        await requestWakeLock();
    }
});

// Iniciar envío de ubicación si el conductor está activo
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

// Enviar actualización de estado
function sendStatusUpdate(status) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, status })
    });
}

// Enviar ubicación del conductor
function sendLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    driverId,
                    status: currentStatus,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            }).catch(() => {
                // Si falla, intenta sincronizar en segundo plano
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.sync.register('sync-location');
                    });
                }
            });
        });
    }
}

// Iniciar envío de ubicación cada 30s
function startLocationUpdates() {
    if (!intervalId) {
        sendLocation(); // Enviar inmediatamente
        intervalId = setInterval(sendLocation, 30000);
    }
}

// Detener envío de ubicación
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

// Manejar cierre de página y enviar estado "Desconectado"
window.addEventListener("beforeunload", () => {
    if (driverId && currentStatus === "Activo") {
        navigator.sendBeacon(WEBHOOK_URL, JSON.stringify({
            driverId,
            status: "Desconectado"
        }));
    }
    stopLocationUpdates();
});

// Actualizar interfaz según estado
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

// Asignar viaje al conductor
function assignTrip(driverIdParam) {
    if (document.getElementById('driverId').value === driverIdParam) {
        setDriverStatus("En viaje");
    }
}

// Registrar Service Worker para sincronización en segundo plano
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/Llegando/service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado con éxito:', registration.scope);
        })
        .catch(error => {
            console.log('Error al registrar Service Worker:', error);
        });
}
