const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let currentStatus = "Inactivo";
let locationInterval = null;

function setDriverStatus(status) {
    const driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    if (status === "Activo") {
        document.getElementById('activeBtn').disabled = true;
        document.getElementById('inactiveBtn').disabled = false;
    } 
    if (status === "Inactivo") {
        document.getElementById('inactiveBtn').disabled = true;
        document.getElementById('activeBtn').disabled = false;
        document.getElementById('tripEndBtn').disabled = true;
    } 
    if (status === "Viaje Finalizado") {
        status = "Inactivo";
    }

    updateStatus(status);
    sendStatusUpdate(driverId, status);

    if (status === "Activo") {
        // Activar intervalo de ubicación
        if (locationInterval) {
            clearInterval(locationInterval);
        }
        locationInterval = setInterval(() => sendLocation(driverId), 30000); // Cada 30 segundos
    } else {
        clearInterval(locationInterval);  // Detener el intervalo si el estado no es activo
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
        }, (error) => {
            console.error("Error al obtener la ubicación: ", error);
        }, {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000
        });
    }
}

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

// Simulación de asignación de viaje
function assignTrip(driverId) {
    if (document.getElementById('driverId').value === driverId) {
        setDriverStatus("En viaje");
    }
}
