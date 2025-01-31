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

// Función para enviar la última ubicación al servidor
function sendLocationToServer() {
    return new Promise((resolve, reject) => {
        self.registration.showNotification("Enviando ubicación en segundo plano...");

        // Obtener la última ubicación guardada
        self.clients.matchAll().then(clients => {
            if (clients.length > 0) {
                clients[0].postMessage({ action: "getLocation" });
            }
        });

        // Enviar datos al servidor
        self.clients.matchAll().then(clients => {
            if (clients.length > 0) {
                clients[0].postMessage({ action: "sendLocation" });
            }
        });

        resolve();
    });
}

self.addEventListener('message', event => {
    if (event.data.action === "sendLocation") {
        const location = JSON.parse(localStorage.getItem("lastLocation"));
        if (location) {
            fetch("https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(location)
            }).then(() => {
                console.log("Ubicación enviada correctamente.");
            }).catch(err => console.error("Error enviando ubicación:", err));
        }
    }
});
