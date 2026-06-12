const Stripe = require('stripe');
const pool = require('../config/db');

let stripeClient = null;

function getStripeClient() {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY no configurada");
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

// WEBHOOK: Solo actualiza el estado, NO inserta nada para evitar duplicados
async function processStripeWebhookEvent(event) {
  const eventType = event?.type;
  
  if (eventType === 'checkout.session.completed') {
    const session = event.data?.object;
    const cedula = session.metadata?.cedula;

    if (cedula) {
      console.log(`💰 [StripeWebhook] Pago confirmado para cédula: ${cedula}. Actualizando status en BD...`);
      
      try {
        // Actualizamos el estatus del notario que ya existe
        const [result] = await pool.query(
          'UPDATE notarios_oficial SET estatus = "pagado" WHERE cedula_profesional = ?',
          [cedula.trim()]
        );
        
        if (result.affectedRows > 0) {
          console.log(`🚀 [Webhook] Registro ${cedula} actualizado a 'pagado'.`);
        }
      } catch (dbError) {
        console.error('❌ Error en Webhook al actualizar BD:', dbError);
        throw dbError; 
      }
    }
  }
}

async function createNotaryRegistrationSubscriptionCheckout(req, res, next) {
  try {
    const stripe = getStripeClient();
    const { notaryId } = req.body;

    if (!notaryId) {
      return res.status(400).json({ message: 'ID de notario requerido.' });
    }

    // Obtenemos los datos del notario para asegurar que el registro existe
    const [rows] = await pool.query('SELECT * FROM notarios_oficial WHERE id = ?', [notaryId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Notario no encontrado.' });
    
    const notary = rows[0];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      // URLs completas con protocolo http/https
      success_url: `${frontendUrl}/nuevo-notario/cuenta?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/nuevo-notario/pago`,
      metadata: {
        cedula: notary.cedula_profesional
      },
      payment_method_collection: 'always',
    });

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("❌ [Checkout] Error:", error);
    return next(error);
  }
}

async function handleStripeWebhook(req, res) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    await processStripeWebhookEvent(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error al procesar evento.' });
  }
}

module.exports = { 
  createNotaryRegistrationSubscriptionCheckout, 
  handleStripeWebhook 
};