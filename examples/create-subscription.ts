/**
 * Example: Create a Subscription
 *
 * This example demonstrates how to create a subscription using the OrcaRail SDK
 * Recurring payments with send_payment_link or auto_charge.
 */

import OrcaRail from '../src/index';

async function createSubscription() {
  const orcarail = new OrcaRail(
    process.env.ORCARAIL_API_KEY || 'ak_live_xxx',
    process.env.ORCARAIL_API_SECRET || 'sk_live_xxx'
  );

  try {
    const subscription = await orcarail.subscriptions.create({
      description: 'Monthly Pro Plan',
      amount: '10.00',
      currency: 'usd',
      token_id: process.env.ORCARAIL_TOKEN_ID || 'your-token-uuid',
      network_id: process.env.ORCARAIL_NETWORK_ID || 'your-network-uuid',
      interval: 'month',
      interval_count: 1,
      collection_method: 'send_payment_link',
      total_cycles: 12,
      payer_email: 'payer@example.com',
      metadata: {
        plan_id: 'pro_monthly',
      },
    });

    console.log('Subscription created successfully!');
    console.log('ID:', subscription.id);
    console.log('Status:', subscription.status);
    console.log('Current period end:', subscription.current_period_end);
    console.log('Latest payment link:', subscription.latest_payment_link?.link);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating subscription:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  createSubscription();
}
