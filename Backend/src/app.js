const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const willsRoutes = require('./routes/willsRoutes');
const sepRoutes = require('./routes/sepRoutes');
const notaryRoutes = require('./routes/notaryRoutes');

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://jorjoto-idgs8-2.tech:5174';

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
// 🔒 MODIFICACIÓN DE SEGURIDAD: Configuramos express.json para capturar el cuerpo crudo (rawBody)
// necesario únicamente para validar las firmas criptográficas de los Webhooks de Stripe.
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      // Si la petición va dirigida hacia el webhook de pagos, preservamos el Buffer crudo original
      if (req.originalUrl.startsWith('/api/payments/webhook') || req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
    },
  }),
);

app.use(cookieParser());

// Ruta de estado de salud del servidor
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'testamento-backend',
  });
});

// Definición de las rutas del sistema
app.use('/api/payments', paymentRoutes);
app.use('/api/wills', willsRoutes);
app.use('/api/sep', sepRoutes);
app.use('/api/notaries', notaryRoutes); // <-- Enlaza perfecto con tu Frontend actual

// Manejador de errores global
app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    message: 'Error interno del servidor.',
  });
});

module.exports = app;