if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log("Service Worker registrado", reg))
        .catch(err => console.error("Error al registrar el Service Worker", err));
}

function trackLocation(driverId) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            navigator.serviceWorker.ready.then(reg => {
                reg.sync.register('sendLocation');
            });

            // Guardar ubicación en IndexedDB (opcional)
            localStorage.setItem("lastLocation", JSON.stringify({
                driverId: driverId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: new Date().toISOString()
            }));
        }, error => {
            console.error("Error obteniendo ubicación:", error);
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
    }
}

// Llamar a trackLocation cuando el conductor esté activo
document.getElementById("activeBtn").addEventListener("click", () => {
    const driverId = document.getElementById('driverId').value;
    if (driverId) {
        trackLocation(driverId);
    }
});
