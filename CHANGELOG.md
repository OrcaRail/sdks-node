# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- The README and the Express and Next.js webhook examples now verify with `webhooks.constructEventFromHeaders` (timestamped v2 signature, rejects replays) instead of the replayable v1 `constructEvent`.
- Resource methods now refuse an id, organization id or slug that would change the request path (empty or blank, `.`, `..`, or containing `/`, `\`, `?`, `#` or NUL) and throw `OrcaRailError` before sending anything. Other characters are percent-encoded. Previously an id taken from request input, such as `?payment_intent=../subscriptions`, could reach another endpoint with your API key.

## [3.6.0] - 2026-11-02

### Added

- `WebhookEventType`: the subscription events the API sends but the type was missing: `subscription.collection_method.updated`, `subscription.payer_wallet.verified`, `subscription.auto_charge.allowance_insufficient`, `subscription.auto_charge.canceled_insufficient_allowance`, `subscription.auto_charge.canceled_insufficient_balance`.
- `PaymentIntent`: fields the API returns: `next_action` (`PaymentIntentNextAction`), `latest_transaction` (`PaymentIntentLatestTransaction`: `hash`, `amount_received`, `address`, `confirmations`, `paid_token`, `paid_network`, `simulated`), `amount_paid`, `amount_paid_currency`, `organization_id`, `display_amount`, `display_currency`, `original_amount`, `original_currency`, `currency_rate_id`, and webhook `created_at` / `updated_at`.

### Deprecated

- `subscription.trial_will_end`, `subscription.past_due` and `subscription.completed` (now `DeprecatedWebhookEventType`): the API never sends them. They stay in the union so existing handlers compile. Use `subscription.payment_link.payment_failed` (payload `status: "past_due"`) or `subscription.auto_charge.allowance_insufficient` instead of `subscription.past_due`.
- `PaymentIntent.latestTransaction`, `expiresAt`, `createdAt`, `updatedAt`, `price_id`, `price`, `product` and the `LatestTransaction` type: never returned by the API. `createdAt` / `updatedAt` are now optional to match runtime.

### Fixed

- `examples/webhook-express.ts` reads `latest_transaction` (the field webhooks actually carry).

## [3.5.1] - 2026-10-31

### Changed

- Docs: `paymentIntents.complete(id)` is required once the customer returns to your `return_url`. Until it is called, a paid intent stays `processing`, the payment is not final or withdrawable and no `payment_intent.completed` webhook is sent.

## [3.5.0] - 2026-10-24

### Added

- `webhooks.constructEventFromHeaders(payload, headers, secret, toleranceSeconds?)`: verifies the timestamped `x-webhook-signature-v2` (HMAC of `"<timestamp>.<body>"`) and rejects deliveries older than 5 minutes (replay protection). Prefer it over `constructEvent`.

### Changed

- Requires Node.js 20 or newer (Node 18 reached end-of-life in April 2025). CI tests Node 20, 22 and 24.

### Security

- Dev tooling upgraded (Vitest 4, typescript-eslint 8, esbuild 0.28). `npm audit` reports 0 issues.

## [3.4.0] - 2026-09-29

### Added

- `OrcaRail#livemode`: `false` for sandbox (`ak_test_`) keys.
- `paymentIntents.simulate(id)`: sandbox only; completes a payment without an on-chain transfer.
- `WebhookEvent.livemode`: `false` for events from sandbox (testnet) organizations.

### Removed

- `livemode` on `ProductCreateParams` / `ProductUpdateParams`: it follows the organization (the API ignored it). Responses still include `livemode`.

## [3.3.0] - 2026-07-30

### Fixed

- Payment Intent confirmation now sends API key authentication required by the guarded API route.
- The SDK User-Agent version now comes from `package.json`.
- Corrected README payment token, network, and withdrawal address examples.

## [3.2.1] - 2026-04-25

### Fixed

- Lint errors in webhooks examples and price tests by replacing `any` types.
- Missing `ProductSummary` import for type safety.

### CI

- Upgraded to Node.js 24 and updated GitHub Actions versions.

## [3.2.0] - 2026-04-25

### Added

- New catalog resources: `Products` and `Prices`.
- New `Rates` resource for fiat quotes and currency listing.
- Added `catalog-plan-metadata` helpers for parsing plan metadata.
- Support for `price_id` in `PaymentIntentCreateParams` and `SubscriptionCreateParams`.
- Refactored `PaymentIntentCreateParams` and `SubscriptionCreateParams` into discriminated unions for better type safety.

### Changed

- **Breaking:** Renamed catalog-related public types: `StripeListEnvelope` → `CatalogListEnvelope`, `StripeProduct` → `CatalogProduct`, `StripePrice` → `CatalogPrice`, `StripePriceRecurring` → `CatalogPriceRecurring`. The previous `Stripe*` names are removed.
- **Breaking:** Updated `PaymentIntentCreateParams` and `SubscriptionCreateParams` to require either `price_id` or full payment/subscription details.

## [1.0.0] - 2024-01-01

### Added

- Initial release
- Payment Intents API support (create, retrieve, confirm, update)
- Webhook signature verification
- TypeScript definitions
- Zero-dependency HTTP client using native fetch
- Support for both ESM and CommonJS
- Comprehensive test suite
- Example code for Express and Next.js

[Unreleased]: https://github.com/orcarail/orcarail-node/compare/v3.2.1...HEAD
[3.2.1]: https://github.com/orcarail/orcarail-node/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/orcarail/orcarail-node/releases/tag/v3.2.0
[1.0.0]: https://github.com/orcarail/orcarail-node/releases/tag/v1.0.0
