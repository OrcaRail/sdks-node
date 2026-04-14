import { HttpClient } from './client';
import { Pay } from './resources/pay';
import { PaymentIntents } from './resources/payment-intents';
import { Price } from './resources/price';
import { Catalog } from './resources/catalog';
import { Subscriptions } from './resources/subscriptions';
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
  Subscription,
  SubscriptionStatus,
  SubscriptionInterval,
  SubscriptionCollectionMethod,
  SubscriptionAutoCharge,
  SubscriptionCreateParams,
  SubscriptionUpdateParams,
  SubscriptionCancelParams,
  SubscriptionListParams,
  SubscriptionListResponse,
  SubscriptionPaymentLinksListParams,
  CatalogProduct,
  CatalogPrice,
  CatalogProductCreateParams,
  CatalogProductUpdateParams,
  CatalogPriceCreateParams,
  CatalogPriceUpdateParams,
  CatalogPriceListParams,
  CatalogPriceSummary,
  CatalogProductSummary,
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
   * Subscriptions resource (Stripe-style)
   */
  public readonly subscriptions: Subscriptions;

  /**
   * Pay resource (slug-based get/cancel)
   */
  public readonly pay: Pay;

  /**
   * Price resource (fiat quote, currencies)
   */
  public readonly price: Price;

  /**
   * Catalog (organization products and prices)
   */
  public readonly catalog: Catalog;

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
    this.subscriptions = new Subscriptions(this.client);
    this.pay = new Pay(this.client);
    this.price = new Price(this.client);
    this.catalog = new Catalog(this.client);
    this.webhooks = new Webhooks();
  }
}

export default OrcaRail;
