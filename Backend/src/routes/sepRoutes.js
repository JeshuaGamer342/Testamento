const express = require('express');
const { validateCedula } = require('../controllers/sepController');

const router = express.Router();

router.post('/grupo/validar-cedula', validateCedula);

module.exports = router;
