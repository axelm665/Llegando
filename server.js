const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

// Ruta para actualizar el estado del conductor
app.post("/driver/status", (req, res) => {
  const { status } = req.body;
  console.log(`Estado del conductor actualizado: ${status}`);
  res.json({ message: "Estado actualizado", status });
});

// Ruta para solicitar un viaje
app.post("/passenger/request-ride", (req, res) => {
  const { pickup, destination } = req.body;
  console.log(`Viaje solicitado desde ${pickup} hasta ${destination}`);
  res.json({ message: "Viaje solicitado", pickup, destination });
});

// Servir archivos estáticos (frontend)
app.use(express.static("frontend"));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
