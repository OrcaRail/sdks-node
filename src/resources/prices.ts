import { HttpClient } from '../client';
import { Products } from './products';
import type {
  PriceCreateParams,
  PriceListParams,
  PriceUpdateParams,
  CatalogListEnvelope,
  CatalogPrice,
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

function buildListQuery(params?: PriceListParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.active != null) search.set('active', String(params.active));
  if (params.recurring != null) search.set('recurring', String(params.recurring));
  if (params.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Organization catalog prices under `/organizations/:id/prices`.
 */
export class Prices {
  constructor(private readonly client: HttpClient) {}

  private unwrapList<T>(body: CatalogListEnvelope<T>): T[] {
    return body.data;
  }

  public async list(organizationId: string, params?: PriceListParams): Promise<CatalogPrice[]> {
    const q = buildListQuery(params);
    const body = await this.client.get<CatalogListEnvelope<CatalogPrice>>(
      `organizations/${organizationId}/prices${q}`,
      true,
    );
    return this.unwrapList(body);
  }

  public async create(organizationId: string, params: PriceCreateParams): Promise<CatalogPrice> {
    return this.client.post<CatalogPrice>(
      `organizations/${organizationId}/prices`,
      params,
      true,
    );
  }

  public async update(
    organizationId: string,
    priceId: string,
    params: PriceUpdateParams,
  ): Promise<CatalogPrice> {
    return this.client.patch<CatalogPrice>(
      `organizations/${organizationId}/prices/${priceId}`,
      params,
      true,
    );
  }

  public async deactivate(organizationId: string, priceId: string): Promise<CatalogPrice> {
    return this.client.delete<CatalogPrice>(
      `organizations/${organizationId}/prices/${priceId}`,
      undefined,
      true,
    );
  }

  /** Active recurring prices (subscriptions). */
  public async listActiveRecurring(organizationId: string): Promise<CatalogPrice[]> {
    return this.list(organizationId, { active: true, recurring: true });
  }

  /**
   * Find an active one-time price by fiat amount, currency, and parent product name.
   */
  public async findOneTimeByAmount(
    organizationId: string,
    params: { amount: string; currencyCode: string; productName: string },
  ): Promise<CatalogPrice | null> {
    const amountStr = normalizeMoneyAmount(params.amount);
    const currencyLower = params.currencyCode.trim().toLowerCase();
    const oneTime = await this.list(organizationId, { recurring: false, active: true });
    const hit = oneTime.find((p) => {
      if (p.type === 'recurring' || p.recurring) return false;
      const prodName =
        typeof p.product === 'object' && p.product && 'name' in p.product
          ? p.product.name
          : '';
      if (prodName !== params.productName) return false;
      const code = (p.currency ?? 'usd').toLowerCase();
      return code === currencyLower && amountsEqual(p.unit_amount_decimal, amountStr);
    });
    return hit ?? null;
  }

  /**
   * Return an existing one-time price or create product + price.
   */
  public async ensureOneTime(
    organizationId: string,
    params: {
      amount: string;
      currencyCode: string;
      tokenId: string;
      networkId: string;
      productName: string;
      productDescription?: string;
      productMetadata?: Record<string, unknown>;
    },
  ): Promise<CatalogPrice> {
    const existing = await this.findOneTimeByAmount(organizationId, {
      amount: params.amount,
      currencyCode: params.currencyCode,
      productName: params.productName,
    });
    if (existing) return existing;

    const amountStr = normalizeMoneyAmount(params.amount);
    const currencyLower = params.currencyCode.trim().toLowerCase();
    const productsApi = new Products(this.client);
    const products = await productsApi.list(organizationId);
    let product = products.find((x) => x.name === params.productName);
    if (!product) {
      product = await productsApi.create(organizationId, {
        name: params.productName,
        description: params.productDescription ?? '',
        active: true,
        metadata: params.productMetadata ?? {},
      });
    }

    const nickname = `demo-pay-onetime-${amountStr}`;
    return this.create(organizationId, {
      product: product.id,
      nickname,
      unit_amount_decimal: amountStr,
      currency: currencyLower,
      token_id: params.tokenId,
      network_id: params.networkId,
      active: true,
      metadata: { seedKey: nickname },
    });
  }
}
