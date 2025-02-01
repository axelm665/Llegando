const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;
let currentStatus = "Inactivo";
let driverId = "";

function setDriverStatus(status) {
    driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    if (status === "Activo") {
        document.getElementById('activeBtn').disabled = true;
        document.getElementById('inactiveBtn').disabled = false;
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

function sendStatusUpdate(status) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, status })
    });
}

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
            });
        });
    }
}

function startLocationUpdates() {
    if (!intervalId) {
        sendLocation(); // Enviar ubicación inmediatamente
        intervalId = setInterval(sendLocation, 30000);
    }
}

function stopLocationUpdates() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

window.addEventListener("beforeunload", () => {
    if (driverId && currentStatus === "Activo") {
        navigator.sendBeacon(WEBHOOK_URL, JSON.stringify({
            driverId,
            status: "Desconectado"
        }));
    }
    stopLocationUpdates();
});

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

function assignTrip(driverIdParam) {
    if (document.getElementById('driverId').value === driverIdParam) {
        setDriverStatus("En viaje");
    }
}
