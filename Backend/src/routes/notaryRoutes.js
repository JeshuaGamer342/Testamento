const express = require('express');
const { getRecommendedNotaries, registerNotary } = require('../controllers/notaryController');

const router = express.Router();

// Ruta para cargar el directorio en el frontend
router.get('/recommended', getRecommendedNotaries);

// NUEVA RUTA: Escucha la petición POST del formulario de registro
router.post('/registro-oficial', registerNotary);

module.exports = router;