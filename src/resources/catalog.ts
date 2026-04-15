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

function normalizeMoneyAmount(raw: string): string {
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return n.toFixed(2);
}

function amountsEqual(a: string, b: string): boolean {
  return Math.abs(parseFloat(a) - parseFloat(b)) < 0.000001;
}

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

  /** Active recurring catalog prices (subscriptions). */
  public async listActiveRecurringPrices(organizationId: string): Promise<CatalogPrice[]> {
    return this.listPrices(organizationId, { active: true, recurring: true });
  }

  /**
   * Find an active one-time catalog price by fiat amount, currency, and parent product name.
   */
  public async findOneTimePriceByAmount(
    organizationId: string,
    params: { amount: string; currencyCode: string; productName: string }
  ): Promise<CatalogPrice | null> {
    const amountStr = normalizeMoneyAmount(params.amount);
    const currencyLower = params.currencyCode.trim().toLowerCase();
    const oneTime = await this.listPrices(organizationId, {
      recurring: false,
      active: true,
    });
    const hit = oneTime.find((p) => {
      if (p.interval != null) return false;
      if (p.product?.name !== params.productName) return false;
      const code = p.currency?.code?.toLowerCase() ?? 'usd';
      return code === currencyLower && amountsEqual(p.amount, amountStr);
    });
    return hit ?? null;
  }

  /**
   * Return an existing one-time price or create product + price. Useful for amount-based checkout.
   */
  public async ensureOneTimePrice(
    organizationId: string,
    params: {
      amount: string;
      currencyCode: string;
      tokenId: string;
      networkId: string;
      productName: string;
      productDescription?: string;
      productMetadata?: Record<string, unknown>;
    }
  ): Promise<CatalogPrice> {
    const existing = await this.findOneTimePriceByAmount(organizationId, {
      amount: params.amount,
      currencyCode: params.currencyCode,
      productName: params.productName,
    });
    if (existing) return existing;

    const amountStr = normalizeMoneyAmount(params.amount);
    const currencyLower = params.currencyCode.trim().toLowerCase();
    const products = await this.listProducts(organizationId);
    let product = products.find((x) => x.name === params.productName);
    if (!product) {
      product = await this.createProduct(organizationId, {
        name: params.productName,
        description: params.productDescription ?? '',
        active: true,
        metadata: params.productMetadata ?? {},
      });
    }

    const nickname = `demo-pay-onetime-${amountStr}`;
    return this.createPrice(organizationId, {
      product_id: product.id,
      nickname,
      amount: amountStr,
      currency: currencyLower,
      token_id: params.tokenId,
      network_id: params.networkId,
      interval: null,
      active: true,
      metadata: { seedKey: nickname },
    });
  }
}
