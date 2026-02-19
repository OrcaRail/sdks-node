/**
 * Example: Next.js API Route Webhook Handler
 *
 * This example demonstrates how to handle OrcaRail webhooks in a Next.js API route.
 *
 * File location: pages/api/webhooks/orcarail.ts (Pages Router)
 * or app/api/webhooks/orcarail/route.ts (App Router)
 *
 * Prerequisites:
 * - Set ORCARAIL_WEBHOOK_SECRET environment variable in .env.local
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import OrcaRail from '../../src/index';

// Disable body parsing - we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  // Get raw body
  // Note: In Next.js, you may need to use a custom body parser middleware
  // or read the raw body manually depending on your setup
  const rawBody = await getRawBody(req);

  // Initialize OrcaRail client (only needed for webhook verification)
  const orcarail = new OrcaRail(
    process.env.ORCARAIL_API_KEY || 'ak_live_xxx',
    process.env.ORCARAIL_API_SECRET || 'sk_live_xxx'
  );

  try {
    // Verify webhook signature and parse event
    const event = orcarail.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // Handle the event asynchronously
    // Don't await - return 200 OK immediately
    handleWebhookEvent(event).catch((error) => {
      console.error('Error handling webhook event:', error);
    });

    // Always return 200 OK immediately
    res.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Webhook signature verification failed:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    res.status(400).json({ error: 'Invalid signature' });
  }
}

/**
 * Get raw body from Next.js request
 * This is a helper function - you may need to adjust based on your Next.js version
 */
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Handle webhook event asynchronously
 */
async function handleWebhookEvent(event: any): Promise<void> {
  switch (event.type) {
    case 'payment_intent.completed':
      const paymentIntent = event.data.object;
      console.log('Payment completed:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
      // TODO: Fulfill order, send confirmation email, update database, etc.
      break;

    case 'payment_intent.processing':
      console.log('Payment processing:', event.data.object.id);
      // TODO: Update order status, notify customer, etc.
      break;

    case 'payment_intent.canceled':
      console.log('Payment canceled:', event.data.object.id);
      // TODO: Release inventory, cancel order, notify customer, etc.
      break;

    default:
      console.log('Unknown event type:', event.type);
  }
}

/**
 * Alternative: App Router version (app/api/webhooks/orcarail/route.ts)
 *
 * import { NextRequest, NextResponse } from 'next/server';
 * import OrcaRail from '../../../src/index';
 *
 * export async function POST(req: NextRequest) {
 *   const signature = req.headers.get('x-webhook-signature');
 *   const webhookSecret = process.env.ORCARAIL_WEBHOOK_SECRET;
 *
 *   if (!signature || !webhookSecret) {
 *     return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
 *   }
 *
 *   const rawBody = await req.text();
 *   const orcarail = new OrcaRail(
 *     process.env.ORCARAIL_API_KEY || 'ak_live_xxx',
 *     process.env.ORCARAIL_API_SECRET || 'sk_live_xxx'
 *   );
 *
 *   try {
 *     const event = orcarail.webhooks.constructEvent(rawBody, signature, webhookSecret);
 *     // Handle event...
 *     return NextResponse.json({ received: true });
 *   } catch (error) {
 *     return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
 *   }
 * }
 */
