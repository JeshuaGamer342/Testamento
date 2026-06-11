const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Rutas Cliente
router.post('/solicitar', chatController.solicitarSesion);
router.get('/cliente/sesiones', chatController.getSesionesCliente);

// Rutas Notario
router.get('/notario/sesiones/:notarioId', chatController.getSesionesNotario);
router.put('/sesion/:id', chatController.actualizarEstadoSesion);

// Mensajería compartida
router.get('/conversacion', chatController.getConversacion);
router.post('/mensaje', chatController.enviarMensaje);

module.exports = router;