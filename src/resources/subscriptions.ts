import { HttpClient } from '../client';
import type {
  PaymentLink,
  Subscription,
  SubscriptionCancelParams,
  SubscriptionCreateParams,
  SubscriptionListParams,
  SubscriptionListResponse,
  SubscriptionPaymentLinksListParams,
  SubscriptionUpdateParams,
} from '../types';

/**
 * Build query string from list params (cursor pagination and filters)
 */
function buildListQuery(params?: SubscriptionListParams): string {
  if (!params) return '';
  const search = new URLSearchParams();

  if (params.status != null) search.set('status', params.status);
  if (params.collection_method != null) search.set('collection_method', params.collection_method);
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.starting_after != null) search.set('starting_after', params.starting_after);
  if (params.ending_before != null) search.set('ending_before', params.ending_before);

  if (params.current_period_start) {
    const s = params.current_period_start;
    if (s.gt) search.set('current_period_start[gt]', s.gt);
    if (s.gte) search.set('current_period_start[gte]', s.gte);
    if (s.lt) search.set('current_period_start[lt]', s.lt);
    if (s.lte) search.set('current_period_start[lte]', s.lte);
  }
  if (params.current_period_end) {
    const e = params.current_period_end;
    if (e.gt) search.set('current_period_end[gt]', e.gt);
    if (e.gte) search.set('current_period_end[gte]', e.gte);
    if (e.lt) search.set('current_period_end[lt]', e.lt);
    if (e.lte) search.set('current_period_end[lte]', e.lte);
  }
  if (params.created) {
    const c = params.created;
    if (c.gt) search.set('created[gt]', c.gt);
    if (c.gte) search.set('created[gte]', c.gte);
    if (c.lt) search.set('created[lt]', c.lt);
    if (c.lte) search.set('created[lte]', c.lte);
  }

  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

function buildPaymentLinksQuery(params?: SubscriptionPaymentLinksListParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.starting_after != null) search.set('starting_after', params.starting_after);
  if (params.ending_before != null) search.set('ending_before', params.ending_before);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Subscriptions resource
 */
export class Subscriptions {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Create a subscription
   *
   * @param params - Subscription creation parameters (snake_case)
   * @returns The created subscription
   */
  public async create(params: SubscriptionCreateParams): Promise<Subscription> {
    return this.client.post<Subscription>('subscriptions', params, true);
  }

  /**
   * Retrieve a subscription by ID
   *
   * @param id - Subscription ID
   * @returns The subscription
   */
  public async retrieve(id: string): Promise<Subscription> {
    return this.client.get<Subscription>(`subscriptions/${id}`, true);
  }

  /**
   * Update a subscription
   *
   * @param id - Subscription ID
   * @param params - Update parameters (all optional)
   * @returns The updated subscription
   */
  public async update(id: string, params: SubscriptionUpdateParams): Promise<Subscription> {
    return this.client.patch<Subscription>(`subscriptions/${id}`, params, true);
  }

  /**
   * Cancel a subscription (immediate or at period end)
   *
   * @param id - Subscription ID
   * @param params - Optional cancellation details (comment, feedback)
   * @returns The canceled subscription
   */
  public async cancel(id: string, params?: SubscriptionCancelParams): Promise<Subscription> {
    return this.client.delete<Subscription>(`subscriptions/${id}`, params ?? undefined, true);
  }

  /**
   * Resume a paused subscription
   *
   * @param id - Subscription ID
   * @returns The resumed subscription
   */
  public async resume(id: string): Promise<Subscription> {
    return this.client.post<Subscription>(`subscriptions/${id}/resume`, {}, true);
  }

  /**
   * List subscriptions with optional filters and cursor-based pagination
   *
   * @param params - Optional list parameters (status, collection_method, date filters, limit, cursor)
   * @returns Paginated list of subscriptions
   */
  public async list(params?: SubscriptionListParams): Promise<SubscriptionListResponse> {
    const query = buildListQuery(params);
    return this.client.get<SubscriptionListResponse>(`subscriptions${query}`, true);
  }

  /**
   * List payment links (cycle invoices) for a subscription
   *
   * @param id - Subscription ID
   * @param params - Optional pagination (limit, starting_after, ending_before)
   * @returns Paginated list of payment links
   */
  public async listPaymentLinks(
    id: string,
    params?: SubscriptionPaymentLinksListParams
  ): Promise<{ data: PaymentLink[]; has_more: boolean }> {
    const query = buildPaymentLinksQuery(params);
    return this.client.get<{ data: PaymentLink[]; has_more: boolean }>(
      `subscriptions/${id}/payment-links${query}`,
      true
    );
  }
}
