/**
 * Example: Express.js Webhook Handler
 *
 * This example demonstrates how to handle OrcaRail webhooks in an Express.js application.
 *
 * Prerequisites:
 * - npm install express
 * - Set ORCARAIL_WEBHOOK_SECRET environment variable
 */

import express from 'express';
import OrcaRail from '../src/index';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OrcaRail client (only needed for webhook verification)
const orcarail = new OrcaRail(
  process.env.ORCARAIL_API_KEY || 'ak_live_xxx',
  process.env.ORCARAIL_API_SECRET || 'sk_live_xxx'
);

// Middleware to capture raw body for signature verification
// Important: Use express.raw() for webhook endpoints to preserve the exact body
app.use('/webhooks/orcarail', express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post('/webhooks/orcarail', (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const webhookSecret = process.env.ORCARAIL_WEBHOOK_SECRET;

  if (!signature) {
    console.error('Missing x-webhook-signature header');
    return res.status(400).json({ error: 'Missing signature header' });
  }

  if (!webhookSecret) {
    console.error('ORCARAIL_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  try {
    // Verify webhook signature and parse event
    const event = orcarail.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.completed':
        handlePaymentCompleted(event);
        break;

      case 'payment_intent.processing':
        handlePaymentProcessing(event);
        break;

      case 'payment_intent.canceled':
        handlePaymentCanceled(event);
        break;

      case 'payment_intent.requires_payment_method':
        handleRequiresPaymentMethod(event);
        break;

      case 'payment_intent.requires_confirmation':
        handleRequiresConfirmation(event);
        break;

      default:
        console.log('Unknown event type:', event.type);
    }

    // Always return 200 OK immediately
    // Process the event asynchronously if needed
    res.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Webhook signature verification failed:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    res.status(400).json({ error: 'Invalid signature' });
  }
});

// Event handlers
function handlePaymentCompleted(event: any) {
  const paymentIntent = event.data.object;
  console.log('Payment completed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    transaction: paymentIntent.latestTransaction,
  });

  // TODO: Fulfill order, send confirmation email, update database, etc.
}

function handlePaymentProcessing(event: any) {
  const paymentIntent = event.data.object;
  console.log('Payment processing:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
  });

  // TODO: Update order status, notify customer, etc.
}

function handlePaymentCanceled(event: any) {
  const paymentIntent = event.data.object;
  console.log('Payment canceled:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
  });

  // TODO: Release inventory, cancel order, notify customer, etc.
}

function handleRequiresPaymentMethod(event: any) {
  const paymentIntent = event.data.object;
  console.log('Payment requires payment method:', {
    id: paymentIntent.id,
  });

  // TODO: Track abandoned checkout, send reminder email, etc.
}

function handleRequiresConfirmation(event: any) {
  const paymentIntent = event.data.object;
  console.log('Payment requires confirmation:', {
    id: paymentIntent.id,
  });

  // TODO: Handle confirmation flow
}

// Start server
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhooks/orcarail`);
});
