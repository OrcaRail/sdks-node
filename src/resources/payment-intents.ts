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
  public async create(
    params: PaymentIntentCreateParams
  ): Promise<PaymentIntent> {
    // Ensure payment_method_types defaults to ['crypto'] if empty
    const requestBody = {
      ...params,
      payment_method_types:
        params.payment_method_types && params.payment_method_types.length > 0
          ? params.payment_method_types
          : ['crypto'],
    };

    return this.client.post<PaymentIntent>(
      'payment_intents',
      requestBody,
      true
    );
  }

  /**
   * Retrieve a Payment Intent by ID
   *
   * @param id - Payment Intent ID (e.g., "pi_1234567890")
   * @returns The Payment Intent
   */
  public async retrieve(id: string): Promise<PaymentIntent> {
    const cleanId = id.startsWith('pi_') ? id : `pi_${id}`;
    const path = `payment_intents/${cleanId}`;

    return this.client.get<PaymentIntent>(path, true);
  }

  /**
   * Cancel a Payment Intent (API: POST /payment_intents/:id/cancel).
   * Use when the user is redirected to your cancel_url (e.g. https://yourapp.com/cancel?payment_intent=pi_20)
   * and you want to mark the intent as canceled on the backend.
   *
   * @param id - Payment Intent ID (e.g. "pi_20" or "20")
   * @returns The canceled Payment Intent
   *
   * @example
   * // When user lands on https://localhost:3001/cancel?payment_intent=pi_20
   * const intent = await orcarail.paymentIntents.cancel('pi_20');
   */
  public async cancel(id: string): Promise<PaymentIntent> {
    const cleanId = id.startsWith('pi_') ? id : `pi_${id}`;
    const path = `payment_intents/${cleanId}/cancel`;

    return this.client.post<PaymentIntent>(path, {}, true);
  }

  /**
   * Confirm a Payment Intent (API: POST /payment_intents/:id/confirm).
   * Redirects the customer to the hosted checkout page.
   *
   * @param id - Payment Intent ID (e.g. "pi_20" or "20")
   * @param params - Confirmation parameters including client_secret and return_url
   * @returns The confirmed Payment Intent
   *
   * @example
   * const intent = await orcarail.paymentIntents.confirm('pi_20', {
   *   client_secret: intent.client_secret,
   *   return_url: 'https://yourapp.com/return',
   * });
   */
  public async confirm(
    id: string,
    params: PaymentIntentConfirmParams
  ): Promise<PaymentIntent> {
    const cleanId = id.startsWith('pi_') ? id : `pi_${id}`;
    const path = `payment_intents/${cleanId}/confirm`;

    return this.client.post<PaymentIntent>(path, params, false);
  }

  /**
   * Complete a Payment Intent (API: POST /payment_intents/:id/complete).
   * Sets the intent to processing and fires the payment_intent.processing webhook.
   * Use when the user is redirected to your success/return URL (e.g. https://yourapp.com/success?payment_intent=pi_34).
   *
   * @param id - Payment Intent ID (e.g. "pi_34" or "34")
   * @returns The updated Payment Intent (status processing)
   *
   * @example
   * // When user lands on https://localhost:3001/success?payment_intent=pi_34
   * const intent = await orcarail.paymentIntents.complete('pi_34');
   */
  public async complete(id: string): Promise<PaymentIntent> {
    const cleanId = id.startsWith('pi_') ? id : `pi_${id}`;
    const path = `payment_intents/${cleanId}/complete`;

    return this.client.post<PaymentIntent>(path, {}, true);
  }

  /**
   * Update a Payment Intent
   *
   * @param id - Payment Intent ID
   * @param params - Update parameters (all optional)
   * @returns The updated Payment Intent
   */
  public async update(
    id: string,
    params: PaymentIntentUpdateParams
  ): Promise<PaymentIntent> {
    const cleanId = id.startsWith('pi_') ? id : `pi_${id}`;
    const path = `payment_intents/${cleanId}`;

    return this.client.patch<PaymentIntent>(path, params, true);
  }
}
