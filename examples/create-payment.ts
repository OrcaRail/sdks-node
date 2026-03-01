/**
 * Example: Create a Payment Intent
 *
 * This example demonstrates how to create a payment intent using the OrcaRail SDK.
 */

import OrcaRail from '../src/index';

async function createPaymentIntent() {
  // Initialize the OrcaRail client
  // Replace with your actual API key and secret
  const orcarail = new OrcaRail(
    process.env.ORCARAIL_API_KEY || 'ak_live_xxx',
    process.env.ORCARAIL_API_SECRET || 'sk_live_xxx'
  );

  try {
    // Create a payment intent
    const intent = await orcarail.paymentIntents.create({
      amount: '100.00',
      currency: 'usd',
      payment_method_types: ['crypto'],
      tokenId: 1, // Replace with your token ID (e.g., USDC)
      networkId: 1, // Replace with your network ID (e.g., Ethereum)
      return_url: 'https://merchant.example.com/return',
      cancel_url: 'https://merchant.example.com/cancel',
      description: 'Payment for services',
      metadata: {
        order_id: '12345',
        customer_id: '67890',
      },
      // withdrawal_address: '0x...', // optional: override where funds are withdrawn; omit to use account default
    });

    console.log('Payment Intent created successfully!');
    console.log('ID:', intent.id);
    console.log('Status:', intent.status);
    console.log('Client Secret:', intent.client_secret);
    console.log('Payment Link:', intent.payment_link?.link);

    // Confirm the payment intent to get the redirect URL
    if (intent.client_secret) {
      const confirmed = await orcarail.paymentIntents.confirm(intent.id, {
        client_secret: intent.client_secret,
        return_url: 'https://merchant.example.com/return',
      });

      console.log('\nPayment Intent confirmed!');
      console.log('Redirect URL:', confirmed.pay_url);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating payment intent:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the example
// Note: This check works in CommonJS. For ESM, you can call createPaymentIntent() directly.
if (typeof require !== 'undefined' && require.main === module) {
  createPaymentIntent();
}
