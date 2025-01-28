let driverStatus = false;

// Función para inicializar el mapa
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

// Actualizar estado del conductor
document.getElementById("toggle-status").addEventListener("click", () => {
  driverStatus = !driverStatus;
  const statusButton = document.getElementById("toggle-status");
  statusButton.textContent = driverStatus ? "No Disponible" : "Estoy Disponible";
  fetch("/driver/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: driverStatus }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
});

// Solicitar viaje
document.getElementById("request-ride").addEventListener("click", () => {
  const pickup = document.getElementById("pickup").value;
  const destination = document.getElementById("destination").value;
  fetch("/passenger/request-ride", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pickup, destination }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
});
