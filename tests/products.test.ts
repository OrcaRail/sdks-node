import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Products } from '../src/resources/products';
import { HttpClient } from '../src/client';
import type { CatalogProduct } from '../src/types';

// Mock HttpClient
const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
} as unknown as HttpClient;

describe('Products', () => {
  let products: Products;
  const orgId = 'org_123';

  beforeEach(() => {
    products = new Products(mockClient);
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list products and unwrap the envelope', async () => {
      const mockProduct: Partial<CatalogProduct> = { id: 'prod_1', name: 'Product 1' };
      const mockResponse = {
        object: 'list',
        data: [mockProduct],
      };

      vi.mocked(mockClient.get).mockResolvedValueOnce(mockResponse);

      const result = await products.list(orgId);

      expect(mockClient.get).toHaveBeenCalledWith(`organizations/${orgId}/products`, true);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const params = { name: 'New Product' };
      const mockResponse: Partial<CatalogProduct> = { id: 'prod_1', name: 'New Product' };

      vi.mocked(mockClient.post).mockResolvedValueOnce(mockResponse);

      const result = await products.create(orgId, params);

      expect(mockClient.post).toHaveBeenCalledWith(`organizations/${orgId}/products`, params, true);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = 'prod_1';
      const params = { name: 'Updated Product' };
      const mockResponse: Partial<CatalogProduct> = { id: productId, name: 'Updated Product' };

      vi.mocked(mockClient.patch).mockResolvedValueOnce(mockResponse);

      const result = await products.update(orgId, productId, params);

      expect(mockClient.patch).toHaveBeenCalledWith(
        `organizations/${orgId}/products/${productId}`,
        params,
        true,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const productId = 'prod_1';
      const mockResponse = { id: productId, object: 'product', deleted: true };

      vi.mocked(mockClient.delete).mockResolvedValueOnce(mockResponse);

      const result = await products.delete(orgId, productId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `organizations/${orgId}/products/${productId}`,
        undefined,
        true,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
