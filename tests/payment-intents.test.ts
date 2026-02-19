import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentIntents } from '../src/resources/payment-intents';
import { HttpClient } from '../src/client';
import type { PaymentIntent } from '../src/types';

// Mock HttpClient
const mockClient = {
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
} as unknown as HttpClient;

describe('PaymentIntents', () => {
  let paymentIntents: PaymentIntents;

  beforeEach(() => {
    paymentIntents = new PaymentIntents(mockClient);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment intent', async () => {
      const params = {
        amount: '100.00',
        currency: 'usd',
        payment_method_types: ['crypto'],
        tokenId: 1,
        networkId: 1,
        return_url: 'https://example.com/return',
      };

      const mockResponse: PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: '100.00',
        currency: 'usd',
        status: 'requires_payment_method',
        payment_method_types: ['crypto'],
        client_secret: 'pi_123_secret',
        return_url: 'https://example.com/return',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValueOnce(mockResponse);

      const result = await paymentIntents.create(params);

      expect(mockClient.post).toHaveBeenCalledWith('payment_intents', params, true);
      expect(result).toEqual(mockResponse);
    });

    it('should default payment_method_types to crypto', async () => {
      const params = {
        amount: '100.00',
        currency: 'usd',
        tokenId: 1,
        networkId: 1,
        return_url: 'https://example.com/return',
      };

      vi.mocked(mockClient.post).mockResolvedValueOnce({
        id: 'pi_123',
        object: 'payment_intent',
        amount: '100.00',
        currency: 'usd',
        status: 'requires_payment_method',
        payment_method_types: ['crypto'],
        return_url: 'https://example.com/return',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      await paymentIntents.create(params);

      expect(mockClient.post).toHaveBeenCalledWith(
        'payment_intents',
        expect.objectContaining({
          payment_method_types: ['crypto'],
        }),
        true
      );
    });
  });

  describe('retrieve', () => {
    it('should retrieve a payment intent', async () => {
      const mockResponse: PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: '100.00',
        currency: 'usd',
        status: 'succeeded',
        payment_method_types: ['crypto'],
        return_url: 'https://example.com/return',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(mockClient.get).mockResolvedValueOnce(mockResponse);

      const result = await paymentIntents.retrieve('pi_123');

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('payment_intents/pi_123'),
        true
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle ID without pi_ prefix', async () => {
      vi.mocked(mockClient.get).mockResolvedValueOnce({
        id: 'pi_123',
        object: 'payment_intent',
        amount: '100.00',
        currency: 'usd',
        status: 'succeeded',
        payment_method_types: ['crypto'],
        return_url: 'https://example.com/return',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      await paymentIntents.retrieve('123');

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('payment_intents/pi_123'),
        true
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a payment intent', async () => {
      const params = {
        client_secret: 'pi_123_secret',
        return_url: 'https://example.com/return',
      };

      const mockResponse: PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: '100.00',
        currency: 'usd',
        status: 'requires_confirmation',
        payment_method_types: ['crypto'],
        return_url: 'https://example.com/return',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValueOnce(mockResponse);

      const result = await paymentIntents.confirm('pi_123', params);

      expect(mockClient.post).toHaveBeenCalledWith('payment_intents/pi_123/confirm', params, false);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a payment intent', async () => {
      const params = {
        amount: '200.00',
        description: 'Updated description',
      };

      const mockResponse: PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: '200.00',
        currency: 'usd',
        status: 'requires_payment_method',
        payment_method_types: ['crypto'],
        description: 'Updated description',
        return_url: 'https://example.com/return',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(mockClient.patch).mockResolvedValueOnce(mockResponse);

      const result = await paymentIntents.update('pi_123', params);

      expect(mockClient.patch).toHaveBeenCalledWith('payment_intents/pi_123', params, true);
      expect(result).toEqual(mockResponse);
    });
  });
});
