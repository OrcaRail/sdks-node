/**
 * Optional metadata shape for demo / dashboard catalog products (subscription tiers).
 * API stores arbitrary JSON on `CatalogProduct.metadata`; this documents a supported convention.
 */
export interface OrcaRailCatalogPlanProductMetadata {
  seedKey?: string;
  tier?: 'free' | 'go' | 'plus' | 'pro' | string;
  tagline?: string;
  features?: string[];
  featuresHeader?: string;
  badge?: string;
  footerNote?: string;
  highlight?: boolean;
  displayPriceNote?: string;
  strikePriceNote?: string;
  /** When true, show as a non-purchasable tier (no recurring price). */
  uiOnly?: boolean;
}

export function parseCatalogPlanMetadata(
  raw: Record<string, unknown> | null | undefined
): OrcaRailCatalogPlanProductMetadata | null {
  if (!raw || typeof raw !== 'object') return null;
  return raw as OrcaRailCatalogPlanProductMetadata;
}
