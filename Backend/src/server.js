const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Inyección de prefijo de rutas
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de TestLink corriendo en http://localhost:${PORT}`);
});