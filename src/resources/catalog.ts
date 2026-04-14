import { HttpClient } from '../client';
import type {
  CatalogPrice,
  CatalogPriceCreateParams,
  CatalogPriceListParams,
  CatalogPriceUpdateParams,
  CatalogProduct,
  CatalogProductCreateParams,
  CatalogProductUpdateParams,
} from '../types';

function buildPriceListQuery(params?: CatalogPriceListParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.active != null) search.set('active', String(params.active));
  if (params.recurring != null) search.set('recurring', String(params.recurring));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Organization catalog (products and prices), Stripe-style.
 */
export class Catalog {
  constructor(private readonly client: HttpClient) {}

  public async listProducts(organizationId: string): Promise<CatalogProduct[]> {
    return this.client.get<CatalogProduct[]>(
      `organizations/${organizationId}/catalog/products`,
      true
    );
  }

  public async createProduct(
    organizationId: string,
    params: CatalogProductCreateParams
  ): Promise<CatalogProduct> {
    return this.client.post<CatalogProduct>(
      `organizations/${organizationId}/catalog/products`,
      params,
      true
    );
  }

  public async updateProduct(
    organizationId: string,
    productId: string,
    params: CatalogProductUpdateParams
  ): Promise<CatalogProduct> {
    return this.client.patch<CatalogProduct>(
      `organizations/${organizationId}/catalog/products/${productId}`,
      params,
      true
    );
  }

  public async deactivateProduct(
    organizationId: string,
    productId: string
  ): Promise<CatalogProduct> {
    return this.client.delete<CatalogProduct>(
      `organizations/${organizationId}/catalog/products/${productId}`,
      undefined,
      true
    );
  }

  public async listPrices(
    organizationId: string,
    params?: CatalogPriceListParams
  ): Promise<CatalogPrice[]> {
    const q = buildPriceListQuery(params);
    return this.client.get<CatalogPrice[]>(
      `organizations/${organizationId}/catalog/prices${q}`,
      true
    );
  }

  public async createPrice(
    organizationId: string,
    params: CatalogPriceCreateParams
  ): Promise<CatalogPrice> {
    return this.client.post<CatalogPrice>(
      `organizations/${organizationId}/catalog/prices`,
      params,
      true
    );
  }

  public async updatePrice(
    organizationId: string,
    priceId: string,
    params: CatalogPriceUpdateParams
  ): Promise<CatalogPrice> {
    return this.client.patch<CatalogPrice>(
      `organizations/${organizationId}/catalog/prices/${priceId}`,
      params,
      true
    );
  }

  public async deactivatePrice(organizationId: string, priceId: string): Promise<CatalogPrice> {
    return this.client.delete<CatalogPrice>(
      `organizations/${organizationId}/catalog/prices/${priceId}`,
      undefined,
      true
    );
  }
}
