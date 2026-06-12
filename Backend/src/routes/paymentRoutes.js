const express = require('express');
const {
	createNotaryRegistrationSubscriptionCheckout,
	handleStripeWebhook,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

router.post(
	'/notary-registration/subscription-checkout',
	createNotaryRegistrationSubscriptionCheckout,
);

module.exports = router;