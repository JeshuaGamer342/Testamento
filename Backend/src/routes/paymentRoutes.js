const express = require('express');
const {
    createNotaryRegistrationSubscriptionCheckout,
    handleStripeWebhook,
} = require('../controllers/paymentController');

const router = express.Router();

// 🔒 MODIFICACIÓN: Quitamos express.raw() de aquí porque ya lo gestionamos de forma segura en app.js
router.post('/stripe/webhook', handleStripeWebhook);

router.post(
    '/notary-registration/subscription-checkout',
    createNotaryRegistrationSubscriptionCheckout,
);

module.exports = router;