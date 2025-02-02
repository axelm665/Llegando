self.onmessage = function(event) {
    const { driverId, status, webhookUrl } = event.data;

    function sendLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const timestamp = new Date().toLocaleString("en-US", {
                    timeZone: "America/Argentina/Buenos_Aires",
                    hour12: false
                });

                fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        driverId,
                        status,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp
                    })
                });
            }, error => console.error("Error obteniendo ubicación:", error), {
                enableHighAccuracy: true,
                maximumAge: 10000
            });
        }
    }

    setInterval(sendLocation, 30000);
    sendLocation();
};
