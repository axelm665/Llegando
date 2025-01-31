const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;
let currentStatus = "Inactivo"; // Estado inicial

function setDriverStatus(status) {
    const driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    // Cambiar el estado visual y actualizar la variable de estado
    updateStatus(status);

    // Enviar la actualización de estado al servidor
    sendStatusUpdate(driverId, status);

    if (status === "Activo") {
        // Si está activo, enviar ubicación cada 30 segundos
        intervalId = setInterval(() => sendLocation(driverId), 30000);
        document.getElementById('activoBtn').disabled = true;
        document.getElementById('inactivoBtn').disabled = false;
        document.getElementById('viajeBtn').disabled = false;
    } else {
        // Si no está activo, detener el envío de ubicación
        clearInterval(intervalId);
        document.getElementById('activoBtn').disabled = false;
    }

    if (status === "Inactivo") {
        document.getElementById('inactivoBtn').disabled = true;
    }

    if (status === "En viaje") {
        document.getElementById('viajeBtn').disabled = true;
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
    const statusElement = document.getElementById('status');
    const activeBtn = document.getElementById('activoBtn');
    const inactiveBtn = document.getElementById('inactivoBtn');
    const viajeBtn = document.getElementById('viajeBtn');

    // Cambiar el color de acuerdo al estado
    if (status === "Activo") {
        statusElement.textContent = "Estado: Activo";
        statusElement.style.backgroundColor = "green";
    } else if (status === "Inactivo") {
        statusElement.textContent = "Estado: Inactivo";
        statusElement.style.backgroundColor = "gray";
    } else if (status === "En viaje") {
        statusElement.textContent = "Estado: En viaje";
        statusElement.style.backgroundColor = "blue";
    }
}
