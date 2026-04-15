import { describe, expect, it } from 'vitest';
import {
  parseCatalogPlanMetadata,
  type OrcaRailCatalogPlanProductMetadata,
} from '../src/catalog-plan-metadata';

describe('parseCatalogPlanMetadata', () => {
  it('returns null for nullish input', () => {
    expect(parseCatalogPlanMetadata(undefined)).toBeNull();
    expect(parseCatalogPlanMetadata(null)).toBeNull();
  });

  it('returns object for plan-shaped metadata', () => {
    const raw: Record<string, unknown> = {
      tier: 'go',
      tagline: 'Keep chatting',
      features: ['Core model'],
      footerNote: 'Ads may apply',
    };
    const parsed = parseCatalogPlanMetadata(raw);
    expect(parsed).toEqual(raw as OrcaRailCatalogPlanProductMetadata);
  });
});
