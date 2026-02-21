import { HttpClient } from '../client';
import type { FiatQuote, FiatQuoteParams, Currency } from '../types';

/**
 * Price resource for fiat quote and currencies
 */
export class Price {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Get a fiat-to-USDC quote: convert an amount in a source currency to USD/USDC.
   *
   * @param params - Amount (string) and currency code (e.g. 'irr', 'usd')
   * @returns Quote with amountUsd, amountUsdc, sourceAmount, sourceCurrency
   *
   * @example
   * const quote = await orcarail.price.getFiatQuote({ amount: '100000', currency: 'irr' });
   * console.log(quote.amountUsdc); // e.g. '2.38'
   */
  public async getFiatQuote(params: FiatQuoteParams): Promise<FiatQuote> {
    const amount = encodeURIComponent(params.amount);
    const currency = encodeURIComponent(params.currency);
    const path = `price/fiat-quote?amount=${amount}&currency=${currency}`;
    return this.client.get<FiatQuote>(path, true);
  }

  /**
   * List supported fiat currencies.
   *
   * @param options - Optional { active: true } to return only active currencies
   * @returns List of currencies (code, name, symbol, decimals, etc.)
   *
   * @example
   * const currencies = await orcarail.price.getCurrencies({ active: true });
   */
  public async getCurrencies(options?: { active?: boolean }): Promise<Currency[]> {
    const query = options?.active === true ? '?active=true' : '';
    const path = `price/currencies${query}`;
    return this.client.get<Currency[]>(path, true);
  }
}
