# OrcaRail Node.js SDK

[![npm version](https://badge.fury.io/js/%40orcarail%2Fnode.svg)](https://badge.fury.io/js/%40orcarail%2Fnode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/orcarail/orcarail-node/workflows/CI/badge.svg)](https://github.com/orcarail/orcarail-node/actions)

Official Node.js SDK for [OrcaRail](https://orcarail.com) - Accept crypto payments with Payment Intents.

## Features

- ✅ **Payment Intents** - Create, retrieve, confirm, and update payment intents
- ✅ **Split and get your commission** - Set a commission % on API keys; it’s applied to quotes, shown to payers, and sent to your withdrawal address
- ✅ **Webhook Verification** - Secure webhook signature verification
- ✅ **TypeScript Support** - Full TypeScript definitions included
- ✅ **Zero Dependencies** - Uses native Node.js APIs (Node 18+)
- ✅ **Dual Package** - Supports both ESM and CommonJS

## Installation

```bash
npm install @orcarail/node
```

or

```bash
yarn add @orcarail/node
```

or

```bash
pnpm add @orcarail/node
```

## Quick Start

```typescript
import OrcaRail from '@orcarail/node';

const orcarail = new OrcaRail('ak_live_xxx', 'sk_live_xxx');

// Create a payment intent
const intent = await orcarail.paymentIntents.create({
  amount: '100.00',
  currency: 'usd',
  payment_method_types: ['crypto'],
  tokenId: 1,
  networkId: 1,
  return_url: 'https://merchant.example.com/return',
});

console.log('Payment Intent ID:', intent.id);
console.log('Client Secret:', intent.client_secret);
```

## API Reference

### Payment Intents

#### Create a Payment Intent

```typescript
const intent = await orcarail.paymentIntents.create({
  amount: '100.00',
  currency: 'usd',
  payment_method_types: ['crypto'],
  tokenId: 1,
  networkId: 1,
  return_url: 'https://merchant.example.com/return',
  cancel_url: 'https://merchant.example.com/cancel', // optional
  description: 'Payment for services', // optional
  metadata: { order_id: '12345' }, // optional
  expires_at: '2024-12-31T23:59:59Z', // optional
  withdrawal_address: '0x...', // optional: override where funds are withdrawn; omit to use account default
});

// API keys can have a commission % (dashboard or PATCH /api/v1/api-keys/:id). Payments created with that key include commission in the quote and send it to your withdrawal address.
```

#### Retrieve a Payment Intent

```typescript
const intent = await orcarail.paymentIntents.retrieve('1234567890');
```

#### Confirm a Payment Intent

```typescript
const intent = await orcarail.paymentIntents.confirm('1234567890', {
  client_secret: '1234567890_secret_abc123',
  return_url: 'https://merchant.example.com/return', // optional
});
```

#### Update a Payment Intent

```typescript
const intent = await orcarail.paymentIntents.update('1234567890', {
  amount: '200.00',
  description: 'Updated description',
  metadata: { order_id: '67890' },
  withdrawal_address: '0x...', // optional: override withdrawal address for this payment
});
```

### Webhooks

#### Verify Webhook Signature

```typescript
import express from 'express';

const app = express();

app.post('/webhooks/orcarail', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const webhookSecret = process.env.ORCARAIL_WEBHOOK_SECRET!;

  try {
    const event = orcarail.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.completed':
        console.log('Payment completed:', event.data.object.id);
        // Fulfill order, send confirmation email, etc.
        break;
      case 'payment_intent.processing':
        console.log('Payment processing:', event.data.object.id);
        break;
      case 'payment_intent.canceled':
        console.log('Payment canceled:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

#### Verify Signature (Boolean)

```typescript
const isValid = orcarail.webhooks.verifySignature(
  rawBody,
  signature,
  webhookSecret
);

if (isValid) {
  // Process webhook
} else {
  // Reject webhook
}
```

## Configuration

```typescript
const orcarail = new OrcaRail('ak_live_xxx', 'sk_live_xxx', {
  baseUrl: 'https://api.orcarail.com/api/v1', // optional
  timeout: 30000, // optional, default: 30000ms
});
```

## Error Handling

The SDK throws typed errors that you can catch:

```typescript
import {
  OrcaRailError,
  OrcaRailAPIError,
  OrcaRailAuthenticationError,
  OrcaRailSignatureVerificationError,
} from '@orcarail/node';

try {
  const intent = await orcarail.paymentIntents.create({...});
} catch (error) {
  if (error instanceof OrcaRailAuthenticationError) {
    console.error('Invalid API credentials');
  } else if (error instanceof OrcaRailAPIError) {
    console.error('API error:', error.statusCode, error.message);
  } else if (error instanceof OrcaRailError) {
    console.error('SDK error:', error.message);
  }
}
```

## TypeScript

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  PaymentIntent,
  PaymentIntentCreateParams,
  WebhookEvent,
  WebhookEventType,
} from '@orcarail/node';
```

## Requirements

- Node.js 18.0.0 or higher
- An OrcaRail account with API keys

## Examples

See the [examples](./examples/) directory for complete examples:

- [Create Payment Intent](./examples/create-payment.ts)
- [Express Webhook Handler](./examples/webhook-express.ts)
- [Next.js API Route](./examples/webhook-nextjs.ts)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- [Documentation](https://docs.orcarail.com)
- [GitHub Issues](https://github.com/orcarail/orcarail-node/issues)
- [Email Support](mailto:support@orcarail.com)
