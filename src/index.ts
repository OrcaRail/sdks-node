import { HttpClient } from './client';
import { Pay } from './resources/pay';
import { PaymentIntents } from './resources/payment-intents';
import { Rates } from './resources/rates';
import { Products } from './resources/products';
import { Prices } from './resources/prices';
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
  CatalogListEnvelope,
  CatalogProduct,
  CatalogPrice,
  CatalogPriceRecurring,
  ProductSummary,
  ExpandedPriceSummary,
  ProductCreateParams,
  ProductUpdateParams,
  PriceCreateParams,
  PriceUpdateParams,
  PriceListParams,
  ProductDataInlineParams,
  CatalogProductCreateParams,
  CatalogProductUpdateParams,
  CatalogPriceCreateParams,
  CatalogPriceUpdateParams,
  CatalogPriceListParams,
  CatalogPriceSummary,
  CatalogProductSummary,
} from './types';

export {
  parseCatalogPlanMetadata,
  type OrcaRailCatalogPlanProductMetadata,
} from './catalog-plan-metadata';

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
   * Subscriptions resource
   */
  public readonly subscriptions: Subscriptions;

  /**
   * Pay resource (slug-based get/cancel)
   */
  public readonly pay: Pay;

  /**
   * Exchange rates / fiat quote resource
   */
  public readonly rates: Rates;

  /**
   * Catalog products
   */
  public readonly products: Products;

  /**
   * Catalog prices
   */
  public readonly prices: Prices;

  /**
   * Webhooks utilities
   */
  public readonly webhooks: Webhooks;

  private readonly client: HttpClient;

  /**
   * false when this client uses a sandbox (testnet) key (`ak_test_…`), true for live keys
   * (`ak_live_…`). The API always decides the mode from the key's organization; this is a
   * convenience for your own code (e.g. never fulfill real orders in test mode).
   */
  public readonly livemode: boolean;

  /**
   * Create a new OrcaRail client instance
   *
   * @param apiKey - Your OrcaRail API key: "ak_live_xxx" (live) or "ak_test_xxx" (sandbox)
   * @param apiSecret - Your OrcaRail API secret: "sk_live_xxx" or "sk_test_xxx"
   * @param config - Optional configuration
   */
  constructor(apiKey: string, apiSecret: string, config?: OrcaRailConfig) {
    this.client = new HttpClient(apiKey, apiSecret, config);
    this.livemode = !apiKey.trim().startsWith('ak_test_');
    this.paymentIntents = new PaymentIntents(this.client);
    this.subscriptions = new Subscriptions(this.client);
    this.pay = new Pay(this.client);
    this.rates = new Rates(this.client);
    this.products = new Products(this.client);
    this.prices = new Prices(this.client);
    this.webhooks = new Webhooks();
  }
}

export default OrcaRail;
