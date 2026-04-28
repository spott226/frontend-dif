require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// =============================
// 🧱 MIDDLEWARES
// =============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// 📌 RUTAS API (PRIMERO)
// =============================
const ocrRoutes = require('./routes/ocr.routes');
const capturaRoutes = require('./routes/captura.routes');

app.use('/api', ocrRoutes);
app.use('/api', capturaRoutes);

// =============================
// ⚠️ FALLBACK API (CLAVE)
// =============================
// Esto evita que Express regrese HTML cuando falle una ruta API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// =============================
// 📁 FRONTEND (HTML)
// =============================
// VA DESPUÉS de las rutas API
app.use(express.static(path.join(__dirname, 'views')));

// =============================
// 📁 UPLOADS (IMÁGENES OCR)
// =============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================
// 🧪 RUTA TEST
// =============================
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

// =============================
// ⚠️ MANEJO DE ERRORES GLOBAL
// =============================
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', err);
  res.status(500).json({
    ok: false,
    mensaje: 'Error interno del servidor',
    detalle: err.message
  });
});

// =============================
// 🚀 LEVANTAR SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});