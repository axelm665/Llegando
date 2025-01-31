self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
});

self.addEventListener('fetch', (event) => {
    // Podrías interceptar las solicitudes si lo necesitas
});

self.addEventListener('push', (event) => {
    // Para manejar notificaciones push si lo quieres integrar en el futuro
});
