import { OrcaRailAPIError, OrcaRailAuthenticationError, OrcaRailError } from './errors';
import type { OrcaRailConfig } from './types';

const DEFAULT_BASE_URL = 'https://api.orcarail.com/api/v1';
const DEFAULT_TIMEOUT = 30000;
const SDK_VERSION = '1.0.0';

/**
 * HTTP client for making requests to the OrcaRail API
 */
export class HttpClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(apiKey: string, apiSecret: string, config?: OrcaRailConfig) {
    if (!apiKey || !apiSecret) {
      throw new OrcaRailError('API key and secret are required');
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = config?.baseUrl || DEFAULT_BASE_URL;
    this.timeout = config?.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Create Basic Auth header from API key and secret
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Build full URL from path
   */
  private buildUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  /**
   * Make an HTTP request with timeout and error handling
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    requireAuth: boolean = true
  ): Promise<T> {
    let url = this.buildUrl(path);
    if (method === 'GET') {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}_=${Date.now()}`;
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `orcarail-node/${SDK_VERSION}`,
    };

    if (requireAuth) {
      headers['Authorization'] = this.getAuthHeader();
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Disable fetch cache so GET requests always hit the API (e.g. Next.js Data Cache)
    if (method === 'GET') {
      (options as RequestInit & { cache?: 'no-store' }).cache = 'no-store';
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    options.signal = controller.signal;

    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // Parse response body
      let responseData: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          typeof responseData === 'object' && responseData !== null && 'message' in responseData
            ? String((responseData as { message: unknown }).message)
            : `API request failed with status ${response.status}`;

        const errorType =
          typeof responseData === 'object' && responseData !== null && 'error' in responseData
            ? String((responseData as { error: unknown }).error)
            : undefined;

        if (response.status === 401) {
          throw new OrcaRailAuthenticationError(errorMessage);
        }

        throw new OrcaRailAPIError(errorMessage, response.status, errorType, responseData);
      }

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof OrcaRailError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new OrcaRailError(`Request timeout after ${this.timeout}ms`);
        }
        throw new OrcaRailError(`Request failed: ${error.message}`);
      }

      throw new OrcaRailError('An unknown error occurred');
    }
  }

  /**
   * GET request
   */
  public async get<T>(path: string, requireAuth: boolean = true): Promise<T> {
    return this.request<T>('GET', path, undefined, requireAuth);
  }

  /**
   * POST request
   */
  public async post<T>(path: string, body?: unknown, requireAuth: boolean = true): Promise<T> {
    return this.request<T>('POST', path, body, requireAuth);
  }

  /**
   * PATCH request
   */
  public async patch<T>(path: string, body?: unknown, requireAuth: boolean = true): Promise<T> {
    return this.request<T>('PATCH', path, body, requireAuth);
  }

  /**
   * PUT request
   */
  public async put<T>(path: string, body?: unknown, requireAuth: boolean = true): Promise<T> {
    return this.request<T>('PUT', path, body, requireAuth);
  }

  /**
   * DELETE request (optional body for APIs that accept it, e.g. subscription cancel)
   */
  public async delete<T>(path: string, body?: unknown, requireAuth: boolean = true): Promise<T> {
    return this.request<T>('DELETE', path, body, requireAuth);
  }
}
