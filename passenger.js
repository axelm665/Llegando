let map, originMarker, destinationMarker, directionsService, directionsRenderer;
let originLocation = null, destinationLocation = null;
const WEBHOOK_URL = "https://hook.us2.make.com/tk84jh72enqpukn9tkaa6ykohgjaojry";

function initMap() {
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
    });

    map.addListener('click', event => {
        if (!originLocation) {
            setMarker('origin', event.latLng);
        } else {
            setMarker('destination', event.latLng);
        }
    });

    document.getElementById('vehicleType').addEventListener('change', () => {
        document.getElementById('confirmButton').disabled = false;
    });
}

function setMarker(type, location) {
    if (type === 'origin') {
        if (originMarker) originMarker.setMap(null);
        originMarker = new google.maps.Marker({ position: location, map, draggable: true });
        originMarker.addListener('dragend', event => setMarker('origin', event.latLng));
        originLocation = location;
    } else {
        if (destinationMarker) destinationMarker.setMap(null);
        destinationMarker = new google.maps.Marker({ position: location, map, draggable: true });
        destinationMarker.addListener('dragend', event => setMarker('destination', event.latLng));
        destinationLocation = location;
    }

    if (originLocation && destinationLocation) {
        calculateFare();
    }
}

function calculateFare() {
    directionsService.route({
        origin: originLocation,
        destination: destinationLocation,
        travelMode: 'DRIVING'
    }, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const distance = result.routes[0].legs[0].distance.value / 1000;
            document.getElementById('distance').innerText = `Distancia: ${distance.toFixed(2)} km`;
            document.getElementById('fare').innerText = `Auto: $${(distance * 500).toFixed(2)} - Moto: $${(distance * 300).toFixed(2)}`;
        }
    });
}

function confirmRide() {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            origin: originLocation,
            destination: destinationLocation,
            vehicleType: document.getElementById('vehicleType').value
        })
    });
}

