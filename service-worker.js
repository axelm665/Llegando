// service-worker.js
self.addEventListener('message', event => {
    if (event.data.action === 'start') {
        self.driverId = event.data.driverId;
        self.trackingInterval = setInterval(() => {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({ type: 'location', driverId: self.driverId }));
            });
        }, 30000);
    } else if (event.data.action === 'stop') {
        clearInterval(self.trackingInterval);
    }
});
