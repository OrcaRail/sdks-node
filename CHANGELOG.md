# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
