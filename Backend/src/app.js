const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const willsRoutes = require('./routes/willsRoutes');

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'testamento-backend',
  });
});

app.use('/api/wills', willsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    message: 'Error interno del servidor.',
  });
});

module.exports = app;
