import { HttpClient } from '../client';
import type {
  PaymentIntent,
  PaymentIntentConfirmParams,
  PaymentIntentCreateParams,
  PaymentIntentUpdateParams,
} from '../types';

/**
 * Payment Intents resource for managing payment intents
 */
export class PaymentIntents {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Create a new Payment Intent
   *
   * @param params - Payment Intent creation parameters
   * @returns The created Payment Intent
   */
  public async create(params: PaymentIntentCreateParams): Promise<PaymentIntent> {
    // Ensure payment_method_types defaults to ['crypto'] if empty
    const requestBody = {
      ...params,
      payment_method_types:
        params.payment_method_types && params.payment_method_types.length > 0
          ? params.payment_method_types
          : ['crypto'],
    };

    return this.client.post<PaymentIntent>('payment_intents', requestBody, true);
  }

  /**
   * Retrieve a Payment Intent by ID
   *
   * @param id - Payment Intent ID (raw, no prefix)
   * @returns The Payment Intent
   */
  public async retrieve(id: string): Promise<PaymentIntent> {
    return this.client.get<PaymentIntent>(`payment_intents/${id}`, true);
  }

  /**
   * Cancel a Payment Intent (API: POST /payment_intents/:id/cancel).
   * Use when the user is redirected to your cancel_url (e.g. https://yourapp.com/cancel?payment_intent=20)
   * and you want to mark the intent as canceled on the backend.
   *
   * @param id - Payment Intent ID (raw, no prefix)
   * @returns The canceled Payment Intent
   *
   * @example
   * // When user lands on https://localhost:3001/cancel?payment_intent=20
   * const intent = await orcarail.paymentIntents.cancel('20');
   */
  public async cancel(id: string): Promise<PaymentIntent> {
    return this.client.post<PaymentIntent>(`payment_intents/${id}/cancel`, {}, true);
  }

  /**
   * Confirm a Payment Intent (API: POST /payment_intents/:id/confirm).
   * Redirects the customer to the hosted pay page.
   *
   * @param id - Payment Intent ID (raw, no prefix)
   * @param params - Confirmation parameters including client_secret and return_url
   * @returns The confirmed Payment Intent
   *
   * @example
   * const intent = await orcarail.paymentIntents.confirm('20', {
   *   client_secret: intent.client_secret,
   *   return_url: 'https://yourapp.com/return',
   * });
   */
  public async confirm(id: string, params: PaymentIntentConfirmParams): Promise<PaymentIntent> {
    return this.client.post<PaymentIntent>(`payment_intents/${id}/confirm`, params, false);
  }

  /**
   * Complete a Payment Intent (API: POST /payment_intents/:id/complete).
   * Sets the intent to processing; when payment is done, payment_intent.completed is sent.
   * Use when the user is redirected to your success/return URL (e.g. https://yourapp.com/success?payment_intent=34).
   *
   * @param id - Payment Intent ID (raw, no prefix)
   * @returns The updated Payment Intent (status processing)
   *
   * @example
   * // When user lands on https://localhost:3001/success?payment_intent=34
   * const intent = await orcarail.paymentIntents.complete('34');
   */
  public async complete(id: string): Promise<PaymentIntent> {
    return this.client.post<PaymentIntent>(`payment_intents/${id}/complete`, {}, true);
  }

  /**
   * Update a Payment Intent
   *
   * @param id - Payment Intent ID (raw, no prefix)
   * @param params - Update parameters (all optional)
   * @returns The updated Payment Intent
   */
  public async update(id: string, params: PaymentIntentUpdateParams): Promise<PaymentIntent> {
    return this.client.patch<PaymentIntent>(`payment_intents/${id}`, params, true);
  }
}
