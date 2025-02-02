// Web Worker para rastrear la ubicación en segundo plano

let watchId = null;

self.onmessage = function (event) {
    if (event.data.command === "start") {
        startTracking();
    } else if (event.data.command === "stop") {
        stopTracking();
    }
};

function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(position => {
            const timestamp = new Date().toISOString();
            const locationData = {
                driverId: event.data.driverId,
                status: "Activo",
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp
            };

            // Enviar la ubicación al hilo principal
            postMessage(locationData);
        }, error => {
            console.error("Error obteniendo ubicación:", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000
        });
    }
}

function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}
