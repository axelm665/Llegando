if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
            console.log('Service Worker registrado con éxito:', reg);
        })
        .catch(error => {
            console.log('Error al registrar Service Worker:', error);
        });
}
