// driver.js
const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;
let currentStatus = "Inactivo";
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock liberado');
            });
        } catch (err) {
            console.error(`Error en wakeLock: ${err.name}, ${err.message}`);
        }
    }
}

function setDriverStatus(status) {
    const driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    if (status === "Activo") {
        document.getElementById('activeBtn').disabled = true;
        document.getElementById('inactiveBtn').disabled = false;
        requestWakeLock();
    } 
    if (status === "Inactivo") {
        document.getElementById('inactiveBtn').disabled = true;
        document.getElementById('activeBtn').disabled = false;
        document.getElementById('tripEndBtn').disabled = true;
        if (wakeLock) wakeLock.release();
    } 
    if (status === "Viaje Finalizado") {
        status = "Inactivo";
    }

    updateStatus(status);
    sendStatusUpdate(driverId, status);

    if (status === "Activo") {
        startBackgroundTracking(driverId);
    } else {
        stopBackgroundTracking();
    }
}

function sendStatusUpdate(driverId, status) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, status })
    });
}

function sendLocation(driverId) {
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
            });
        });
    }
}

function updateStatus(status) {
    currentStatus = status;
    document.getElementById('statusText').textContent = status;
    document.getElementById('statusIndicator').style.backgroundColor =
        status === "Activo" ? "green" : status === "En viaje" ? "blue" : "red";
}

function startBackgroundTracking(driverId) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                registration.active?.postMessage({ driverId, action: 'start' });
            });
    }
}

function stopBackgroundTracking() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
            .then(registration => {
                registration?.active?.postMessage({ action: 'stop' });
            });
    }
}

navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'location') {
        sendLocation(event.data.driverId);
    }
});
