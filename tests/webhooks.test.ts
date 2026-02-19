import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { Webhooks } from '../src/webhooks';
import { OrcaRailSignatureVerificationError } from '../src/errors';
import type { WebhookEvent } from '../src/types';

describe('Webhooks', () => {
  const webhooks = new Webhooks();
  const secret = 'test_secret_key';

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
        created: 1234567890,
      });

      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      const isValid = webhooks.verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
        created: 1234567890,
      });

      const invalidSignature = 'invalid_signature';

      const isValid = webhooks.verifySignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should reject tampered payload', () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
        created: 1234567890,
      });

      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      const tamperedPayload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_456' } }, // Changed ID
        created: 1234567890,
      });

      const isValid = webhooks.verifySignature(tamperedPayload, signature, secret);
      expect(isValid).toBe(false);
    });

    it('should handle Buffer input', () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
        created: 1234567890,
      });

      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      const buffer = Buffer.from(payload, 'utf8');
      const isValid = webhooks.verifySignature(buffer, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should return false for empty signature or secret', () => {
      const payload = 'test payload';
      expect(webhooks.verifySignature(payload, '', secret)).toBe(false);
      expect(webhooks.verifySignature(payload, 'signature', '')).toBe(false);
    });
  });

  describe('constructEvent', () => {
    it('should construct event with valid signature', () => {
      const event: WebhookEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            object: 'payment_intent',
            amount: '100.00',
            currency: 'usd',
            status: 'succeeded',
            payment_method_types: ['crypto'],
            return_url: 'https://example.com/return',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        created: 1234567890,
      };

      const payload = JSON.stringify(event);
      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      const result = webhooks.constructEvent(payload, signature, secret);
      expect(result).toEqual(event);
    });

    it('should throw error for invalid signature', () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
        created: 1234567890,
      });

      const invalidSignature = 'invalid_signature';

      expect(() => {
        webhooks.constructEvent(payload, invalidSignature, secret);
      }).toThrow(OrcaRailSignatureVerificationError);
    });

    it('should throw error for invalid JSON', () => {
      const invalidPayload = 'not valid json';
      const signature = createHmac('sha256', secret).update(invalidPayload).digest('hex');

      expect(() => {
        webhooks.constructEvent(invalidPayload, signature, secret);
      }).toThrow(OrcaRailSignatureVerificationError);
    });

    it('should handle Buffer input', () => {
      const event: WebhookEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            object: 'payment_intent',
            amount: '100.00',
            currency: 'usd',
            status: 'succeeded',
            payment_method_types: ['crypto'],
            return_url: 'https://example.com/return',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        created: 1234567890,
      };

      const payload = JSON.stringify(event);
      const buffer = Buffer.from(payload, 'utf8');
      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      const result = webhooks.constructEvent(buffer, signature, secret);
      expect(result).toEqual(event);
    });
  });
});
