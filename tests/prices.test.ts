import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prices } from '../src/resources/prices';
import { HttpClient } from '../src/client';
import type { CatalogPrice, CatalogProduct } from '../src/types';

// Mock HttpClient
const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
} as unknown as HttpClient;

describe('Prices', () => {
  let prices: Prices;
  const orgId = 'org_123';

  beforeEach(() => {
    prices = new Prices(mockClient);
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list prices with query parameters', async () => {
      const mockResponse = {
        object: 'list',
        data: [{ id: 'price_1', unit_amount_decimal: '10.00' }],
      };

      vi.mocked(mockClient.get).mockResolvedValueOnce(mockResponse);

      const result = await prices.list(orgId, { active: true, recurring: false });

      expect(mockClient.get).toHaveBeenCalledWith(
        `organizations/${orgId}/prices?active=true&recurring=false`,
        true,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('findOneTimeByAmount', () => {
    it('should find a matching one-time price', async () => {
      const mockPrices: Partial<CatalogPrice>[] = [
        {
          id: 'price_1',
          type: 'one_time',
          recurring: null,
          unit_amount_decimal: '100.00',
          currency: 'usd',
          product: { id: 'prod_1', name: 'Plan A' } as any,
        },
      ];

      vi.mocked(mockClient.get).mockResolvedValueOnce({ object: 'list', data: mockPrices });

      const result = await prices.findOneTimeByAmount(orgId, {
        amount: '100',
        currencyCode: 'USD',
        productName: 'Plan A',
      });

      expect(result).toEqual(mockPrices[0]);
    });

    it('should return null if currency does not match', async () => {
      const mockPrices: Partial<CatalogPrice>[] = [
        {
          id: 'price_1',
          type: 'one_time',
          recurring: null,
          unit_amount_decimal: '100.00',
          currency: 'eur',
          product: { id: 'prod_1', name: 'Plan A' } as any,
        },
      ];

      vi.mocked(mockClient.get).mockResolvedValueOnce({ object: 'list', data: mockPrices });

      const result = await prices.findOneTimeByAmount(orgId, {
        amount: '100',
        currencyCode: 'USD',
        productName: 'Plan A',
      });

      expect(result).toBeNull();
    });

    it('should return null if currency is missing/null (safety fix check)', async () => {
      const mockPrices: Partial<CatalogPrice>[] = [
        {
          id: 'price_1',
          type: 'one_time',
          recurring: null,
          unit_amount_decimal: '100.00',
          currency: null,
          product: { id: 'prod_1', name: 'Plan A' } as any,
        },
      ];

      vi.mocked(mockClient.get).mockResolvedValueOnce({ object: 'list', data: mockPrices });

      const result = await prices.findOneTimeByAmount(orgId, {
        amount: '100',
        currencyCode: 'USD',
        productName: 'Plan A',
      });

      expect(result).toBeNull();
    });
  });

  describe('ensureOneTime', () => {
    it('should return existing price if found', async () => {
      const mockPrice: Partial<CatalogPrice> = { id: 'price_existing' };
      // findOneTimeByAmount will call list
      vi.mocked(mockClient.get).mockResolvedValueOnce({
        object: 'list',
        data: [
          {
            id: 'price_existing',
            type: 'one_time',
            recurring: null,
            unit_amount_decimal: '50.00',
            currency: 'usd',
            product: { id: 'prod_1', name: 'Pro' } as any,
          },
        ],
      });

      const result = await prices.ensureOneTime(orgId, {
        amount: '50',
        currencyCode: 'usd',
        productName: 'Pro',
        tokenId: 't1',
        networkId: 'n1',
      });

      expect(result.id).toBe('price_existing');
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should create product and price if not found', async () => {
      // 1. findOneTimeByAmount -> list prices (empty)
      vi.mocked(mockClient.get).mockResolvedValueOnce({ object: 'list', data: [] });
      // 2. productsApi.list -> list products (empty)
      vi.mocked(mockClient.get).mockResolvedValueOnce({ object: 'list', data: [] });
      // 3. productsApi.create
      const mockProduct: Partial<CatalogProduct> = { id: 'prod_new', name: 'NewPro' };
      vi.mocked(mockClient.post).mockResolvedValueOnce(mockProduct);
      // 4. prices.create
      const mockPrice: Partial<CatalogPrice> = { id: 'price_new' };
      vi.mocked(mockClient.post).mockResolvedValueOnce(mockPrice);

      const result = await prices.ensureOneTime(orgId, {
        amount: '75',
        currencyCode: 'usd',
        productName: 'NewPro',
        tokenId: 't1',
        networkId: 'n1',
      });

      expect(result.id).toBe('price_new');
      expect(mockClient.post).toHaveBeenCalledTimes(2); // 1 for product, 1 for price
    });
  });
});
