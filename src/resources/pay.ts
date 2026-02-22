import { HttpClient } from '../client';
import type { PaymentIntent } from '../types';

/**
 * Pay resource for slug-based pay flows (public endpoints)
 */
export class Pay {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Get pay details by slug
   *
   * @param slug - Pay slug from the payment link URL
   * @returns Pay details including payment intent
   */
  public async get(slug: string): Promise<PaymentIntent & Record<string, unknown>> {
    const path = `pay/${encodeURIComponent(slug)}`;
    return this.client.get<PaymentIntent & Record<string, unknown>>(path, true);
  }

  /**
   * Cancel payment intent by pay slug
   *
   * @param slug - Pay slug from the payment link URL
   * @returns The canceled payment intent and optional cancel_url for redirect
   */
  public async cancel(slug: string): Promise<PaymentIntent & { cancel_url?: string }> {
    const path = `pay/${encodeURIComponent(slug)}/cancel`;
    return this.client.post<PaymentIntent & { cancel_url?: string }>(path, {}, true);
  }
}
