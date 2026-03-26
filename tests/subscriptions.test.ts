import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Subscriptions } from '../src/resources/subscriptions';
import { HttpClient } from '../src/client';
import type { Subscription } from '../src/types';

const mockClient = {
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
} as unknown as HttpClient;

const baseSubscription: Subscription = {
  id: 'sub_123',
  object: 'subscription',
  status: 'active',
  collection_method: 'send_payment_link',
  description: 'Monthly Pro Plan',
  amount: '10.00',
  currency: 'usd',
  token: { id: 'tok_1', symbol: 'USDC', name: 'USD Coin' },
  network: { id: 'net_1', name: 'Base', chain_id: 8453 },
  interval: 'month',
  interval_count: 1,
  total_cycles: 12,
  completed_cycles: 0,
  billing_cycle_anchor: 1679609767,
  current_period_start: '2025-03-01T00:00:00Z',
  current_period_end: '2025-04-01T00:00:00Z',
  start_date: '2025-01-01T00:00:00Z',
  ended_at: null,
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  cancellation_details: { comment: null, feedback: null, reason: null },
  trial_start: null,
  trial_end: null,
  auto_charge: null,
  payer: { id: 'usr_1', email: 'payer@example.com' },
  latest_payment_link: null,
  withdrawal_addresses: {},
  metadata: null,
  created: '2025-01-01T00:00:00Z',
  updated: '2025-01-01T00:00:00Z',
};

describe('Subscriptions', () => {
  let subscriptions: Subscriptions;

  beforeEach(() => {
    subscriptions = new Subscriptions(mockClient);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a subscription', async () => {
      const params = {
        description: 'Monthly Pro Plan',
        amount: '10.00',
        currency: 'usd',
        token_id: 'tok_1',
        network_id: 'net_1',
        interval: 'month' as const,
      };

      vi.mocked(mockClient.post).mockResolvedValueOnce(baseSubscription);

      const result = await subscriptions.create(params);

      expect(mockClient.post).toHaveBeenCalledWith('subscriptions', params, true);
      expect(result).toEqual(baseSubscription);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a subscription', async () => {
      vi.mocked(mockClient.get).mockResolvedValueOnce(baseSubscription);

      const result = await subscriptions.retrieve('sub_123');

      expect(mockClient.get).toHaveBeenCalledWith('subscriptions/sub_123', true);
      expect(result).toEqual(baseSubscription);
    });
  });

  describe('update', () => {
    it('should update a subscription', async () => {
      const params = { description: 'Updated plan', cancel_at_period_end: true };
      const updated = { ...baseSubscription, ...params };

      vi.mocked(mockClient.patch).mockResolvedValueOnce(updated);

      const result = await subscriptions.update('sub_123', params);

      expect(mockClient.patch).toHaveBeenCalledWith('subscriptions/sub_123', params, true);
      expect(result.description).toBe('Updated plan');
    });
  });

  describe('cancel', () => {
    it('should cancel a subscription without params', async () => {
      const canceled = { ...baseSubscription, status: 'canceled' as const };
      vi.mocked(mockClient.delete).mockResolvedValueOnce(canceled);

      const result = await subscriptions.cancel('sub_123');

      expect(mockClient.delete).toHaveBeenCalledWith('subscriptions/sub_123', undefined, true);
      expect(result.status).toBe('canceled');
    });

    it('should cancel a subscription with cancellation_details', async () => {
      const params = {
        cancellation_details: { comment: 'No longer needed', feedback: 'other' as const },
      };
      const canceled = { ...baseSubscription, status: 'canceled' as const };
      vi.mocked(mockClient.delete).mockResolvedValueOnce(canceled);

      await subscriptions.cancel('sub_123', params);

      expect(mockClient.delete).toHaveBeenCalledWith('subscriptions/sub_123', params, true);
    });
  });

  describe('resume', () => {
    it('should resume a paused subscription', async () => {
      const resumed = { ...baseSubscription, status: 'active' as const };
      vi.mocked(mockClient.post).mockResolvedValueOnce(resumed);

      const result = await subscriptions.resume('sub_123');

      expect(mockClient.post).toHaveBeenCalledWith('subscriptions/sub_123/resume', {}, true);
      expect(result.status).toBe('active');
    });
  });

  describe('list', () => {
    it('should list subscriptions without params', async () => {
      const response = { data: [baseSubscription], has_more: false };
      vi.mocked(mockClient.get).mockResolvedValueOnce(response);

      const result = await subscriptions.list();

      expect(mockClient.get).toHaveBeenCalledWith('subscriptions', true);
      expect(result.data).toHaveLength(1);
      expect(result.has_more).toBe(false);
    });

    it('should list subscriptions with status and pagination', async () => {
      const response = { data: [baseSubscription], has_more: true };
      vi.mocked(mockClient.get).mockResolvedValueOnce(response);

      await subscriptions.list({
        status: 'active',
        limit: 10,
        starting_after: 'sub_prev',
      });

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringMatching(/^subscriptions\?/), true);
      const callUrl = vi.mocked(mockClient.get).mock.calls[0][0];
      expect(callUrl).toContain('status=active');
      expect(callUrl).toContain('limit=10');
      expect(callUrl).toContain('starting_after=sub_prev');
    });

    it('should list subscriptions with date filters', async () => {
      const response = { data: [], has_more: false };
      vi.mocked(mockClient.get).mockResolvedValueOnce(response);

      await subscriptions.list({
        current_period_end: { lte: '2025-04-01T00:00:00Z' },
        created: { gte: '2025-01-01T00:00:00Z' },
      });

      const callUrl = vi.mocked(mockClient.get).mock.calls[0][0];
      expect(callUrl).toContain('current_period_end%5Blte%5D='); // [lte]
      expect(callUrl).toContain('created%5Bgte%5D='); // [gte]
    });
  });

  describe('listPaymentLinks', () => {
    it('should list payment links without params', async () => {
      const response = {
        data: [{ id: 'pl_1', unique_slug: 'abc', link: 'https://pay.example.com/abc' }],
        has_more: false,
      };
      vi.mocked(mockClient.get).mockResolvedValueOnce(response);

      const result = await subscriptions.listPaymentLinks('sub_123');

      expect(mockClient.get).toHaveBeenCalledWith('subscriptions/sub_123/payment-links', true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('pl_1');
      expect(result.has_more).toBe(false);
    });

    it('should list payment links with limit', async () => {
      const response = { data: [], has_more: false };
      vi.mocked(mockClient.get).mockResolvedValueOnce(response);

      await subscriptions.listPaymentLinks('sub_123', { limit: 10 });

      const callUrl = vi.mocked(mockClient.get).mock.calls[0][0];
      expect(callUrl).toContain('subscriptions/sub_123/payment-links');
      expect(callUrl).toContain('limit=10');
    });

    it('should list payment links with pagination params', async () => {
      const response = { data: [], has_more: true };
      vi.mocked(mockClient.get).mockResolvedValueOnce(response);

      await subscriptions.listPaymentLinks('sub_123', {
        limit: 5,
        starting_after: 'pl_prev',
        ending_before: 'pl_next',
      });

      const callUrl = vi.mocked(mockClient.get).mock.calls[0][0];
      expect(callUrl).toContain('limit=5');
      expect(callUrl).toContain('starting_after=pl_prev');
      expect(callUrl).toContain('ending_before=pl_next');
    });
  });
});
