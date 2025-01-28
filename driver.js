const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";
let intervalId = null;

function setDriverStatus(status) {
    const driverId = document.getElementById('driverId').value;
    if (!driverId) {
        alert("Ingrese su ID de conductor");
        return;
    }

    sendStatusUpdate(driverId, status);

    if (status === "Activo") {
        intervalId = setInterval(() => sendLocation(driverId), 60000);
    } else {
        clearInterval(intervalId);
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
                    status: "Activo",
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            });
        });
    }
}
