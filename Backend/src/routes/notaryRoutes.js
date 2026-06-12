const express = require('express');
const { getRecommendedNotaries } = require('../controllers/notaryController');

const router = express.Router();

router.get('/recommended', getRecommendedNotaries);

module.exports = router;
