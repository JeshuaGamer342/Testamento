<<<<<<< HEAD
const app = require('./app');

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutandose en el puerto ${PORT}`);
});
=======
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
>>>>>>> 2e0d8f237f49a3824555c94e36953984f1b6ef4f
