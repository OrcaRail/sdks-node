import { HttpClient } from '../client';
import type { FiatQuote, FiatQuoteParams, Currency } from '../types';

/**
 * Exchange rates / fiat quote resource (GET /v1/rates/...)
 */
export class Rates {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Get a fiat-to-USDC quote: convert an amount in a source currency to USD/USDC.
   */
  public async getFiatQuote(params: FiatQuoteParams): Promise<FiatQuote> {
    const amount = encodeURIComponent(params.amount);
    const currency = encodeURIComponent(params.currency);
    const path = `rates/fiat-quote?amount=${amount}&currency=${currency}`;
    return this.client.get<FiatQuote>(path, true);
  }

  /**
   * List supported fiat currencies.
   */
  public async getCurrencies(options?: {
    active?: boolean;
  }): Promise<Currency[]> {
    const query = options?.active === true ? '?active=true' : '';
    const path = `rates/currencies${query}`;
    return this.client.get<Currency[]>(path, true);
  }
}
