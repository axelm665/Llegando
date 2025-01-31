self.addEventListener('install', event => {
    console.log("Service Worker instalado");
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log("Service Worker activado");
    return self.clients.claim();
});

self.addEventListener('sync', event => {
    if (event.tag === 'sendLocation') {
        event.waitUntil(sendLocationToServer());
    }
});

function sendLocationToServer() {
    return new Promise((resolve, reject) => {
        self.registration.showNotification("Enviando ubicación...");
        self.navigator.geolocation.getCurrentPosition(position => {
            fetch("https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: new Date().toISOString()
                })
            }).then(response => resolve()).catch(err => reject(err));
        }, reject);
    });
}
