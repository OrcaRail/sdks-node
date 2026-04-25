import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Rates } from '../src/resources/rates';
import { HttpClient } from '../src/client';

// Mock HttpClient
const mockClient = {
  get: vi.fn(),
} as unknown as HttpClient;

describe('Rates', () => {
  let rates: Rates;

  beforeEach(() => {
    rates = new Rates(mockClient);
    vi.clearAllMocks();
  });

  describe('getFiatQuote', () => {
    it('should get a fiat quote with encoded parameters', async () => {
      const params = {
        amount: '100000',
        currency: 'irr',
      };

      const mockResponse = {
        amountUsd: '2.00',
        amountUsdc: '2.00',
        sourceAmount: '100000',
        sourceCurrency: 'irr',
      };

      vi.mocked(mockClient.get).mockResolvedValueOnce(mockResponse);

      const result = await rates.getFiatQuote(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        'rates/fiat-quote?amount=100000&currency=irr',
        true,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrencies', () => {
    it('should list all currencies when no options provided', async () => {
      const mockResponse = [{ id: '1', code: 'usd', name: 'US Dollar', isActive: true }];
      vi.mocked(mockClient.get).mockResolvedValueOnce(mockResponse);

      const result = await rates.getCurrencies();

      expect(mockClient.get).toHaveBeenCalledWith('rates/currencies', true);
      expect(result).toEqual(mockResponse);
    });

    it('should list active currencies when active=true', async () => {
      vi.mocked(mockClient.get).mockResolvedValueOnce([]);

      await rates.getCurrencies({ active: true });

      expect(mockClient.get).toHaveBeenCalledWith('rates/currencies?active=true', true);
    });
  });
});
