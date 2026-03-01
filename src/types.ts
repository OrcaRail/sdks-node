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
   * Amount to charge (e.g., "100.00")
   */
  amount: string;

  /**
   * Currency code (e.g., "usd")
   */
  currency: string;

  /**
   * Payment method types (must include "crypto")
   * @default ["crypto"]
   */
  payment_method_types?: string[];

  /**
   * Token ID (UUID, e.g., USDC, USDT)
   */
  tokenId: string;

  /**
   * Network ID (UUID, e.g., Ethereum, Polygon)
   */
  networkId: string;

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
   * Override withdrawal address for this payment intent (when null, user's default is used)
   */
  withdrawal_address?: string | null;
}

/**
 * Parameters for updating a Payment Intent
 */
export interface PaymentIntentUpdateParams {
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
   * Override withdrawal address for this payment intent (when null, user's default is used)
   */
  withdrawal_address?: string | null;
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

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'payment_intent.completed'
  | 'payment_intent.processing'
  | 'payment_intent.canceled'
  | 'payment_intent.requires_payment_method'
  | 'payment_intent.requires_confirmation';

/**
 * Webhook event data object
 */
export interface WebhookEventData {
  /**
   * Payment Intent object
   */
  object: PaymentIntent;
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
