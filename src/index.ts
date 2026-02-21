import { HttpClient } from './client';
import { Checkout } from './resources/checkout';
import { PaymentIntents } from './resources/payment-intents';
import { Price } from './resources/price';
import { Webhooks } from './webhooks';
import type { OrcaRailConfig } from './types';

// Re-export all types
export type {
  OrcaRailConfig,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentIntentCreateParams,
  PaymentIntentUpdateParams,
  PaymentIntentConfirmParams,
  PaymentLink,
  LatestTransaction,
  WebhookEvent,
  WebhookEventType,
  WebhookEventData,
  FiatQuoteParams,
  FiatQuote,
  Currency,
} from './types';

// Re-export all errors
export {
  OrcaRailError,
  OrcaRailAPIError,
  OrcaRailAuthenticationError,
  OrcaRailSignatureVerificationError,
} from './errors';

/**
 * OrcaRail Node.js SDK
 *
 * @example
 * ```typescript
 * import OrcaRail from '@orcarail/node';
 *
 * const orcarail = new OrcaRail('ak_live_xxx', 'sk_live_xxx');
 *
 * // Create a payment intent
 * const intent = await orcarail.paymentIntents.create({
 *   amount: '100.00',
 *   currency: 'usd',
 *   payment_method_types: ['crypto'],
 *   tokenId: 1,
 *   networkId: 1,
 *   return_url: 'https://merchant.example.com/return',
 * });
 * ```
 */
export class OrcaRail {
  /**
   * Payment Intents resource
   */
  public readonly paymentIntents: PaymentIntents;

  /**
   * Checkout resource (slug-based get/cancel)
   */
  public readonly checkout: Checkout;

  /**
   * Price resource (fiat quote, currencies)
   */
  public readonly price: Price;

  /**
   * Webhooks utilities
   */
  public readonly webhooks: Webhooks;

  private readonly client: HttpClient;

  /**
   * Create a new OrcaRail client instance
   *
   * @param apiKey - Your OrcaRail API key (e.g., "ak_live_xxx")
   * @param apiSecret - Your OrcaRail API secret (e.g., "sk_live_xxx")
   * @param config - Optional configuration
   */
  constructor(apiKey: string, apiSecret: string, config?: OrcaRailConfig) {
    this.client = new HttpClient(apiKey, apiSecret, config);
    this.paymentIntents = new PaymentIntents(this.client);
    this.checkout = new Checkout(this.client);
    this.price = new Price(this.client);
    this.webhooks = new Webhooks();
  }
}

export default OrcaRail;
