const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const willsRoutes = require('./routes/willsRoutes');
const sepRoutes = require('./routes/sepRoutes');
const notaryRoutes = require('./routes/notaryRoutes');

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use('/api/payments', paymentRoutes);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'testamento-backend',
  });
});

app.use('/api/wills', willsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sep', sepRoutes);
app.use('/api/notaries', notaryRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    message: 'Error interno del servidor.',
  });
});

module.exports = app;
