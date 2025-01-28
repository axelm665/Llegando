function initMap() {
    if (typeof google === 'undefined') {
        alert("Google Maps no se ha cargado correctamente. Verifica la API Key.");
        return;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -55.5686 },
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    navigator.geolocation.getCurrentPosition(position => {
        originLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setMarker('origin', originLocation);
    }, error => {
        alert("No se pudo obtener la ubicación actual.");
    });

    map.addListener('click', event => {
        if (!originLocation) {
            setMarker('origin', event.latLng);
        } else {
            setMarker('destination', event.latLng);
        }
    });
}
