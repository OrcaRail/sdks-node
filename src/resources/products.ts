import { HttpClient } from '../client';
import { pathSegment } from '../path-segment';
import type {
  ProductCreateParams,
  ProductUpdateParams,
  CatalogListEnvelope,
  CatalogProduct,
} from '../types';

export class Products {
  constructor(private readonly client: HttpClient) {}

  private unwrapList<T>(body: CatalogListEnvelope<T>): T[] {
    return body.data;
  }

  public async list(organizationId: string): Promise<CatalogProduct[]> {
    const body = await this.client.get<CatalogListEnvelope<CatalogProduct>>(
      `organizations/${pathSegment(organizationId, 'organizationId')}/products`,
      true,
    );
    return this.unwrapList(body);
  }

  public async create(
    organizationId: string,
    params: ProductCreateParams,
  ): Promise<CatalogProduct> {
    return this.client.post<CatalogProduct>(
      `organizations/${pathSegment(organizationId, 'organizationId')}/products`,
      params,
      true,
    );
  }

  public async update(
    organizationId: string,
    productId: string,
    params: ProductUpdateParams,
  ): Promise<CatalogProduct> {
    return this.client.patch<CatalogProduct>(
      `organizations/${pathSegment(organizationId, 'organizationId')}/products/${pathSegment(productId, 'productId')}`,
      params,
      true,
    );
  }

  public async delete(
    organizationId: string,
    productId: string,
  ): Promise<{ id: string; object: 'product'; deleted: true }> {
    return this.client.delete<{ id: string; object: 'product'; deleted: true }>(
      `organizations/${pathSegment(organizationId, 'organizationId')}/products/${pathSegment(productId, 'productId')}`,
      undefined,
      true,
    );
  }
}
