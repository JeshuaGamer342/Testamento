const Stripe = require('stripe');
const pool = require('../config/db');

let stripeClient = null;

function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

function getCedulaFromMetadata(metadata) {
  if (typeof metadata?.cedula !== 'string') {
    return '';
  }

  return metadata.cedula.trim();
}

function toDateFromUnixTimestamp(unixTimestamp) {
  if (!Number.isFinite(unixTimestamp)) {
    return null;
  }

  return new Date(unixTimestamp * 1000);
}

function resolveMembershipExpiryDate(subscription) {
  const status = typeof subscription?.status === 'string' ? subscription.status : '';

  if (status === 'canceled' || status === 'incomplete_expired' || status === 'unpaid') {
    return new Date();
  }

  return toDateFromUnixTimestamp(subscription?.current_period_end);
}

async function applyMembershipExpiryByCedula({ cedula, expiryDate, sourceEvent }) {
  if (!cedula || !(expiryDate instanceof Date) || Number.isNaN(expiryDate.getTime())) {
    return;
  }

  const [notaryRows] = await pool.query(
    'SELECT id FROM notarios_oficial WHERE cedula_profesional = ? LIMIT 1',
    [cedula],
  );

  if (notaryRows.length === 0) {
    console.warn(
      `[StripeWebhook:${sourceEvent}] No se encontro notario para cedula ${cedula}.`,
    );
    return;
  }

  const notaryId = notaryRows[0].id;
  const [accessRows] = await pool.query(
    'SELECT id FROM notarios_acceso WHERE notario_id = ? LIMIT 1',
    [notaryId],
  );

  if (accessRows.length === 0) {
    console.warn(
      `[StripeWebhook:${sourceEvent}] No existe registro en notarios_acceso para notario_id ${notaryId}.`,
    );
    return;
  }

  await pool.query('UPDATE notarios_acceso SET pago_expira_el = ? WHERE notario_id = ?', [
    expiryDate,
    notaryId,
  ]);
}

async function retrieveSubscriptionById(stripe, subscriptionId, sourceEvent) {
  if (typeof subscriptionId !== 'string' || !subscriptionId) {
    return null;
  }

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error(
      `[StripeWebhook:${sourceEvent}] No se pudo recuperar la suscripcion ${subscriptionId}.`,
      error,
    );
    return null;
  }
}

async function syncMembershipFromSubscription({ stripe, subscription, fallbackCedula, sourceEvent }) {
  let resolvedSubscription = subscription;

  if (typeof subscription === 'string') {
    resolvedSubscription = await retrieveSubscriptionById(stripe, subscription, sourceEvent);
  }

  if (!resolvedSubscription) {
    return;
  }

  const cedula = getCedulaFromMetadata(resolvedSubscription.metadata) || fallbackCedula || '';
  const expiryDate = resolveMembershipExpiryDate(resolvedSubscription);

  await applyMembershipExpiryByCedula({
    cedula,
    expiryDate,
    sourceEvent,
  });
}

async function processStripeWebhookEvent(event, stripe) {
  const eventType = event?.type;

  if (eventType === 'checkout.session.completed') {
    const session = event.data?.object;

    if (session?.mode !== 'subscription') {
      return;
    }

    await syncMembershipFromSubscription({
      stripe,
      subscription: session.subscription,
      fallbackCedula: getCedulaFromMetadata(session.metadata),
      sourceEvent: eventType,
    });

    return;
  }

  if (eventType === 'invoice.paid') {
    const invoice = event.data?.object;

    await syncMembershipFromSubscription({
      stripe,
      subscription: invoice?.subscription,
      fallbackCedula: getCedulaFromMetadata(invoice?.metadata),
      sourceEvent: eventType,
    });

    return;
  }

  if (
    eventType === 'customer.subscription.created' ||
    eventType === 'customer.subscription.updated' ||
    eventType === 'customer.subscription.deleted'
  ) {
    const subscription = event.data?.object;

    await syncMembershipFromSubscription({
      stripe,
      subscription,
      fallbackCedula: '',
      sourceEvent: eventType,
    });
  }
}

async function createNotaryRegistrationSubscriptionCheckout(req, res, next) {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return res.status(500).json({
        message: 'La pasarela de pago no esta configurada en el servidor.',
      });
    }

    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({
        message: 'Falta configurar STRIPE_PRICE_ID para la suscripcion.',
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      `${frontendUrl}/nuevo-notario/cuenta?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL || `${frontendUrl}/nuevo-notario/pago`;

    const cardholderName =
      typeof req.body?.cardholderName === 'string' ? req.body.cardholderName.trim() : '';
    const billingEmail =
      typeof req.body?.billingEmail === 'string' ? req.body.billingEmail.trim() : '';
    const cedula = typeof req.body?.cedula === 'string' ? req.body.cedula.trim() : '';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'es',
      ...(billingEmail ? { customer_email: billingEmail } : {}),
      metadata: {
        flow: 'notary_registration_subscription',
        ...(cardholderName ? { cardholder_name: cardholderName } : {}),
        ...(cedula ? { cedula } : {}),
      },
      subscription_data: {
        metadata: {
          flow: 'notary_registration_subscription',
          ...(cedula ? { cedula } : {}),
        },
      },
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    if (!session.url) {
      return res.status(500).json({
        message: 'No se pudo iniciar la suscripcion en Stripe Checkout.',
      });
    }

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
      priceId,
      flow: 'subscription',
    });
  } catch (error) {
    return next(error);
  }
}

async function handleStripeWebhook(req, res) {
  const stripe = getStripeClient();

  if (!stripe) {
    return res.status(500).json({
      message: 'La pasarela de pago no esta configurada en el servidor.',
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({
      message: 'Falta configurar STRIPE_WEBHOOK_SECRET en el servidor.',
    });
  }

  const stripeSignature = req.headers['stripe-signature'];

  if (typeof stripeSignature !== 'string' || !stripeSignature.trim()) {
    return res.status(400).json({
      message: 'Cabecera stripe-signature no encontrada.',
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, stripeSignature, webhookSecret);
  } catch (error) {
    return res.status(400).json({
      message: `Firma invalida del webhook: ${error.message}`,
    });
  }

  try {
    await processStripeWebhookEvent(event, stripe);

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error(`[StripeWebhook:${event.type}] Error al procesar evento.`, error);

    return res.status(500).json({
      message: 'No se pudo procesar el webhook de Stripe.',
    });
  }
}

module.exports = {
  createNotaryRegistrationSubscriptionCheckout,
  handleStripeWebhook,
};