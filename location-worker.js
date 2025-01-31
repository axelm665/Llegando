let driverId = null;

self.onmessage = function(event) {
    if (event.data.command === "startTracking") {
        driverId = event.data.driverId;
        trackLocation();
    } else if (event.data.command === "stopTracking") {
        self.close();
    }
};

function trackLocation() {
    if (!driverId) return;

    setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetch("https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        driverId: driverId,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    })
                });
            });
        }
    }, 30000); // Envía ubicación cada 30 segundos
}
