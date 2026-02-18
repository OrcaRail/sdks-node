import { HttpClient } from '../client';
import type { PaymentIntent } from '../types';

/**
 * Checkout resource for slug-based checkout flows (public endpoints)
 */
export class Checkout {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Get checkout details by slug
   *
   * @param slug - Checkout slug from the payment link URL
   * @returns Checkout details including payment intent
   */
  public async get(slug: string): Promise<PaymentIntent & Record<string, unknown>> {
    const path = `checkout/${encodeURIComponent(slug)}`;
    return this.client.get<PaymentIntent & Record<string, unknown>>(path, true);
  }

  /**
   * Cancel payment intent by checkout slug
   *
   * @param slug - Checkout slug from the payment link URL
   * @returns The canceled payment intent and optional cancel_url for redirect
   */
  public async cancel(slug: string): Promise<PaymentIntent & { cancel_url?: string }> {
    const path = `checkout/${encodeURIComponent(slug)}/cancel`;
    return this.client.post<PaymentIntent & { cancel_url?: string }>(path, {}, true);
  }
}
