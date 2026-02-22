import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../src/client';
import { OrcaRailError, OrcaRailAPIError, OrcaRailAuthenticationError } from '../src/errors';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HttpClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should throw error if API key or secret is missing', () => {
      expect(() => new HttpClient('', 'secret')).toThrow(OrcaRailError);
      expect(() => new HttpClient('key', '')).toThrow(OrcaRailError);
    });

    it('should create client with default config', () => {
      const client = new HttpClient('key', 'secret');
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should create client with custom config', () => {
      const client = new HttpClient('key', 'secret', {
        baseUrl: 'https://custom.api.com',
        timeout: 5000,
      });
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('get', () => {
    it('should make GET request with Basic Auth', async () => {
      const client = new HttpClient('ak_test', 'sk_test');
      const mockResponse = { id: '123' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await client.get('/payment_intents');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/payment_intents'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic'),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 401 authentication error', async () => {
      const client = new HttpClient('ak_test', 'sk_test');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Invalid credentials',
          error: 'authentication_error',
        }),
      });

      await expect(client.get('/payment_intents')).rejects.toThrow(OrcaRailAuthenticationError);
    });

    it('should handle API errors', async () => {
      const client = new HttpClient('ak_test', 'sk_test');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Invalid request',
          error: 'bad_request',
        }),
      });

      await expect(client.get('/payment_intents')).rejects.toThrow(OrcaRailAPIError);
    });

    it('should accept timeout configuration', () => {
      const client = new HttpClient('ak_test', 'sk_test', { timeout: 5000 });
      expect(client).toBeInstanceOf(HttpClient);
      // Note: Actual timeout behavior is tested via integration tests
      // as AbortController timeout is a native browser/Node API
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      const client = new HttpClient('ak_test', 'sk_test');
      const body = { amount: '100.00', currency: 'usd' };
      const mockResponse = { id: '123', ...body };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await client.post('/payment_intents', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/payment_intents'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('patch', () => {
    it('should make PATCH request', async () => {
      const client = new HttpClient('ak_test', 'sk_test');
      const body = { amount: '200.00' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '123', amount: '200.00' }),
      });

      await client.patch('/payment_intents/123', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/payment_intents/123'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });
});
