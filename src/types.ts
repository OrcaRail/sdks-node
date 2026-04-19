/**
 * Configuration options for the OrcaRail client
 */
export interface OrcaRailConfig {
  /**
   * Base URL for the OrcaRail API
   * @default "https://api.orcarail.com/api/v1"
   */
  baseUrl?: string;

  /**
   * API version
   * @default "v1"
   */
  apiVersion?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Parameters for creating a Payment Intent
 */
export interface PaymentIntentCreateParams {
  /**
   * Catalog price UUID. When provided, amount/currency/tokenId/networkId become optional.
   */
  price_id?: string;

  /**
   * Amount to charge (e.g., "100.00")
   */
  amount?: string;

  /**
   * Currency code (e.g., "usd")
   */
  currency?: string;

  /**
   * Payment method types (must include "crypto")
   * @default ["crypto"]
   */
  payment_method_types?: string[];

  /**
   * Token ID (UUID, e.g., USDC, USDT)
   */
  tokenId?: string;

  /**
   * Network ID (UUID, e.g., Ethereum, Polygon)
   */
  networkId?: string;

  /**
   * Return URL after payment completion
   */
  return_url: string;

  /**
   * Cancel URL if payment is canceled
   */
  cancel_url?: string | null;

  /**
   * Payment description
   */
  description?: string;

  /**
   * Custom metadata object
   */
  metadata?: Record<string, unknown> | null;

  /**
   * ISO 8601 expiration timestamp
   */
  expires_at?: string | null;

  /**
   * Withdrawal addresses by chain type (e.g. { evm: '0x...', solana: '...' }). When omitted, user's default from Withdrawal Settings is used.
   */
  withdrawal_addresses?: Record<string, string>;
}

/**
 * Parameters for updating a Payment Intent
 */
export interface PaymentIntentUpdateParams {
  /**
   * Updated catalog price UUID
   */
  price_id?: string;

  /**
   * Updated amount
   */
  amount?: string;

  /**
   * Updated currency
   */
  currency?: string;

  /**
   * Updated payment method types
   */
  payment_method_types?: string[];

  /**
   * Updated token ID (UUID)
   */
  tokenId?: string;

  /**
   * Updated network ID (UUID)
   */
  networkId?: string;

  /**
   * Updated return URL
   */
  return_url?: string;

  /**
   * Updated cancel URL
   */
  cancel_url?: string | null;

  /**
   * Updated description
   */
  description?: string;

  /**
   * Updated metadata
   */
  metadata?: Record<string, unknown> | null;

  /**
   * Updated expiration timestamp
   */
  expires_at?: string | null;

  /**
   * Withdrawal addresses by chain type (e.g. { evm: '0x...', solana: '...' }). When omitted, user's default from Withdrawal Settings is used.
   */
  withdrawal_addresses?: Record<string, string>;
}

/**
 * Parameters for confirming a Payment Intent
 */
export interface PaymentIntentConfirmParams {
  /**
   * Client secret for the payment intent (from create/retrieve response)
   */
  client_secret: string;

  /**
   * Return URL after payment completion
   */
  return_url: string;
}

/**
 * Payment Link object
 */
export interface PaymentLink {
  /**
   * Payment link ID (UUID)
   */
  id: string;

  /**
   * Unique slug
   */
  unique_slug?: string;

  /**
   * Payment link URL
   */
  link: string;
}

/**
 * Payment transaction status values returned by the API.
 * Aligns with API PaymentStatusEnum.
 */
export type PaymentStatus =
  | 'pending'
  | 'partial_confirmed'
  | 'confirmed'
  | 'canceled'
  | 'expired'
  | 'completed'
  | 'withdrawn';

/**
 * Latest transaction details
 */
export interface LatestTransaction {
  /**
   * Transaction ID
   */
  id: string;

  /**
   * Transaction status (enum value from API)
   */
  status: PaymentStatus;

  /**
   * Transaction hash
   */
  hash?: string;

  /**
   * Transaction amount
   */
  amount?: string;

  /**
   * Transaction address
   */
  address?: string;
}

/**
 * Payment Intent object
 */
export interface PaymentIntent {
  /**
   * Payment Intent ID (raw, no prefix)
   */
  id: string;

  /**
   * Object type (always "payment_intent")
   */
  object: string;

  /**
   * Amount to charge
   */
  amount: string;

  /**
   * Currency code (from currency relation)
   */
  currency: string;

  /**
   * Currency entity ID (from currency relation)
   */
  currency_id?: string;

  /**
   * Current status (enum value from API)
   */
  status: PaymentIntentStatus;

  /**
   * Payment method types
   */
  payment_method_types: string[];

  /** Catalog price UUID */
  price_id?: string;

  /** Expanded catalog price context */
  price?: CatalogPriceSummary | null;

  /** Expanded catalog product context */
  product?: CatalogProductSummary | null;

  /**
   * Client secret used to confirm the payment intent from the frontend
   */
  client_secret?: string;

  /**
   * Pay URL (clean URL without secrets)
   */
  pay_url?: string;

  /**
   * Return URL
   */
  return_url: string;

  /**
   * Cancel URL
   */
  cancel_url?: string | null;

  /**
   * Payment description
   */
  description?: string | null;

  /**
   * Custom metadata
   */
  metadata?: Record<string, unknown> | null;

  /**
   * Payment link object
   */
  payment_link?: PaymentLink;

  /**
   * Expiration timestamp
   */
  expiresAt?: string;

  /**
   * Latest transaction details (for completed intents)
   */
  latestTransaction?: LatestTransaction;

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last update timestamp
   */
  updatedAt: string;
}

/**
 * Payment Intent status values returned by the API.
 * Aligns with API enum: requires_payment_method | requires_confirmation | processing | completed | canceled
 */
export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'completed'
  | 'canceled';

// --- Subscription types ---

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused'
  | 'completed';

export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';

export interface CatalogListEnvelope<T> {
  object: 'list';
  url: string;
  has_more: boolean;
  data: T[];
}

/**
 * Expanded price on subscription / payment intent API responses.
 */
export interface ExpandedPriceSummary {
  object?: 'price';
  id: string;
  unit_amount_decimal: string;
  currency?:
    | string
    | { id: string; code: string; name?: string | null; symbol?: string | null }
    | null;
  nickname?: string | null;
  active?: boolean;
  recurring?: {
    interval: SubscriptionInterval;
    interval_count: number;
    trial_period_days?: number | null;
    usage_type?: string;
  } | null;
  type?: 'one_time' | 'recurring';
  product_id?: string;
  currency_id?: string;
  token_id?: string;
  network_id?: string;
  metadata?: Record<string, unknown> | null;
  token?: { id: string; symbol: string; name: string } | null;
  network?: { id: string; name: string; chain_id?: number | null } | null;
  /** @deprecated Prefer unit_amount_decimal */
  amount?: string;
  interval?: SubscriptionInterval | null;
  interval_count?: number | null;
}

/** @deprecated Use ExpandedPriceSummary */
export type CatalogPriceSummary = ExpandedPriceSummary;

export interface ProductSummary {
  id: string;
  name: string;
  description?: string | null;
  active?: boolean;
  /** Present on public catalog price rows when product images are resolved. */
  images?: string[];
  metadata?: Record<string, unknown> | null;
}

/** @deprecated Use ProductSummary */
export type CatalogProductSummary = ProductSummary;

export interface CatalogProduct {
  object: 'product';
  id: string;
  active: boolean;
  created: number;
  default_price: string | null;
  description?: string | null;
  images: string[];
  image_file_ids?: string[];
  marketing_features: { name: string }[];
  livemode: boolean;
  metadata: Record<string, unknown>;
  name: string;
  shippable: boolean | null;
  statement_descriptor: string | null;
  unit_label: string | null;
  updated: number;
  url: string | null;
}

export interface CatalogPriceRecurring {
  interval: SubscriptionInterval;
  interval_count: number;
  trial_period_days: number | null;
  usage_type: string;
}

export interface CatalogPrice {
  object: 'price';
  id: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, unknown>;
  nickname: string | null;
  product: string | ProductSummary;
  recurring: CatalogPriceRecurring | null;
  type: 'one_time' | 'recurring';
  unit_amount_decimal: string;
  token?: { id: string; symbol: string; name: string } | null;
  network?: { id: string; name: string; chain_id?: number | null } | null;
}

export interface ProductCreateParams {
  name: string;
  description?: string | null;
  active?: boolean;
  metadata?: Record<string, unknown>;
  default_price?: string;
  image_file_ids?: string[];
  marketing_features?: { name: string }[];
  statement_descriptor?: string | null;
  unit_label?: string | null;
  shippable?: boolean | null;
  url?: string | null;
  livemode?: boolean;
}

/** @deprecated Use ProductCreateParams */
export type CatalogProductCreateParams = ProductCreateParams;

export interface ProductUpdateParams {
  name?: string;
  description?: string | null;
  active?: boolean;
  metadata?: Record<string, unknown> | null;
  default_price?: string | null;
  image_file_ids?: string[] | null;
  marketing_features?: { name: string }[] | null;
  statement_descriptor?: string | null;
  unit_label?: string | null;
  shippable?: boolean | null;
  url?: string | null;
  livemode?: boolean;
}

/** @deprecated Use ProductUpdateParams */
export type CatalogProductUpdateParams = ProductUpdateParams;

export interface ProductDataInlineParams {
  name: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
  statement_descriptor?: string | null;
  unit_label?: string | null;
}

export interface PriceCreateParams {
  product?: string;
  product_data?: ProductDataInlineParams;
  unit_amount_decimal: string;
  currency: string;
  token_id: string;
  network_id: string;
  recurring?: {
    interval: SubscriptionInterval;
    interval_count?: number;
    trial_period_days?: number;
  } | null;
  lookup_key?: string;
  transfer_lookup_key?: boolean;
  nickname?: string | null;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

/** @deprecated Use PriceCreateParams */
export type CatalogPriceCreateParams = PriceCreateParams;

export interface PriceUpdateParams {
  product?: string;
  nickname?: string | null;
  unit_amount_decimal?: string;
  currency?: string;
  token_id?: string;
  network_id?: string;
  recurring?: {
    interval?: SubscriptionInterval | null;
    interval_count?: number | null;
    trial_period_days?: number | null;
  } | null;
  lookup_key?: string | null;
  transfer_lookup_key?: boolean;
  active?: boolean;
  metadata?: Record<string, unknown> | null;
}

/** @deprecated Use PriceUpdateParams */
export type CatalogPriceUpdateParams = PriceUpdateParams;

export interface PriceListParams {
  active?: boolean;
  recurring?: boolean;
  limit?: number;
}

/** @deprecated Use PriceListParams */
export type CatalogPriceListParams = PriceListParams;

export type SubscriptionCollectionMethod = 'send_payment_link' | 'auto_charge';

export interface SubscriptionAutoCharge {
  payer_wallet_address: string;
  payer_network_id: string;
  payer_token_id: string;
  allowance_tx_hash: string | null;
  approved_amount: string | null;
  status: 'pending' | 'approved' | 'revoked' | 'failed';
}

export interface Subscription {
  id: string;
  object: 'subscription';
  status: SubscriptionStatus;
  collection_method: SubscriptionCollectionMethod;
  description: string;
  amount: string;
  currency: string;
  token: { id: string; symbol: string; name: string };
  network: { id: string; name: string; chain_id: number };
  price_id?: string | null;
  price?: CatalogPriceSummary | null;
  product?: CatalogProductSummary | null;
  interval: SubscriptionInterval;
  interval_count: number;
  total_cycles: number | null;
  completed_cycles: number;
  billing_cycle_anchor: number;
  current_period_start: string;
  current_period_end: string;
  start_date: string;
  ended_at: string | null;
  cancel_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  };
  trial_start: string | null;
  trial_end: string | null;
  auto_charge: SubscriptionAutoCharge | null;
  payer: { id: string; email: string } | null;
  latest_payment_link: PaymentLink | null;
  payment_links?: { object: 'list'; data: PaymentLink[]; has_more: boolean };
  withdrawal_addresses: Record<string, string>;
  metadata: Record<string, unknown> | null;
  return_url: string | null;
  cancel_url: string | null;
  created: string;
  updated: string;
}

export interface SubscriptionCreateParams {
  description: string;
  price_id?: string;
  amount?: string;
  currency?: string;
  token_id?: string;
  network_id?: string;
  interval: SubscriptionInterval;
  interval_count?: number;
  collection_method?: SubscriptionCollectionMethod;
  total_cycles?: number;
  billing_cycle_anchor?: string;
  cancel_at?: string;
  cancel_at_period_end?: boolean;
  days_until_due?: number;
  trial_end?: string;
  trial_period_days?: number;
  payer_user_id?: string;
  payer_email?: string;
  withdrawal_addresses?: Record<string, string>;
  metadata?: Record<string, unknown>;
  return_url?: string;
  cancel_url?: string;
}

export interface SubscriptionUpdateParams {
  price_id?: string;
  description?: string;
  amount?: string;
  currency?: string;
  token_id?: string;
  network_id?: string;
  collection_method?: SubscriptionCollectionMethod;
  cancel_at?: string | null;
  cancel_at_period_end?: boolean;
  days_until_due?: number;
  trial_end?: string;
  metadata?: Record<string, unknown>;
  withdrawal_addresses?: Record<string, string>;
  pause_collection?: { behavior: 'void' | 'keep_as_draft' } | null;
  return_url?: string | null;
  cancel_url?: string | null;
}

export interface SubscriptionCancelParams {
  cancellation_details?: {
    comment?: string;
    feedback?: 'too_expensive' | 'missing_features' | 'switched_service' | 'unused' | 'other';
  };
}

export interface SubscriptionListParams {
  status?: SubscriptionStatus;
  collection_method?: SubscriptionCollectionMethod;
  current_period_start?: { gt?: string; gte?: string; lt?: string; lte?: string };
  current_period_end?: { gt?: string; gte?: string; lt?: string; lte?: string };
  created?: { gt?: string; gte?: string; lt?: string; lte?: string };
  limit?: number;
  starting_after?: string;
  ending_before?: string;
}

export interface SubscriptionListResponse {
  data: Subscription[];
  has_more: boolean;
}

/**
 * Parameters for listing payment links for a subscription (cursor pagination)
 */
export interface SubscriptionPaymentLinksListParams {
  limit?: number;
  starting_after?: string;
  ending_before?: string;
}

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'payment_intent.completed'
  | 'payment_intent.processing'
  | 'payment_intent.canceled'
  | 'payment_intent.requires_payment_method'
  | 'payment_intent.requires_confirmation'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'subscription.trial_will_end'
  | 'subscription.payment_link.created'
  | 'subscription.payment_link.paid'
  | 'subscription.payment_link.payment_failed'
  | 'subscription.past_due'
  | 'subscription.completed';

/**
 * Webhook event data object
 */
export interface WebhookEventData {
  /**
   * Payment Intent or Subscription object (depends on event type)
   */
  object: PaymentIntent | Subscription;
}

/**
 * Webhook event structure
 */
export interface WebhookEvent {
  /**
   * Event type
   */
  type: WebhookEventType;

  /**
   * Event data
   */
  data: WebhookEventData;

  /**
   * Unix timestamp when the event was created
   */
  created: number;
}

/**
 * Parameters for fiat-to-USDC quote
 */
export interface FiatQuoteParams {
  /**
   * Amount in source currency (e.g. "100000")
   */
  amount: string;

  /**
   * Source currency code (e.g. "irr", "usd")
   */
  currency: string;
}

/**
 * Fiat-to-USDC quote response
 */
export interface FiatQuote {
  /**
   * Amount in USD
   */
  amountUsd: string;

  /**
   * Amount in USDC (same as USD for stablecoin)
   */
  amountUsdc: string;

  /**
   * Original amount in source currency
   */
  sourceAmount: string;

  /**
   * Source currency code
   */
  sourceCurrency: string;
}

/**
 * Currency from the price API
 */
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol?: string | null;
  decimals: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
