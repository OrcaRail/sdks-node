import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HttpClient } from '../src/client';
import { PaymentIntents } from '../src/resources/payment-intents';
import { Subscriptions } from '../src/resources/subscriptions';
import { Products } from '../src/resources/products';
import { Prices } from '../src/resources/prices';
import { Pay } from '../src/resources/pay';

/**
 * plan/security 2026-11-04 (NODE-1): ids were put into URL paths as-is, so an id taken from
 * user input (the docs show `req.query.payment_intent`) could walk to another endpoint:
 * `payment_intents/../subscriptions?limit=100`.
 */
const mockClient = {
  get: vi.fn().mockResolvedValue({}),
  post: vi.fn().mockResolvedValue({}),
  patch: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
} as unknown as HttpClient;

const UNSAFE_IDS = [
  '../subscriptions?limit=100',
  '..',
  '.',
  '',
  '  ',
  'a/b',
  'a\\b',
  'x#y',
  'x?y',
  'x\0y',
];

const intents = new PaymentIntents(mockClient);
const subscriptions = new Subscriptions(mockClient);
const products = new Products(mockClient);
const prices = new Prices(mockClient);
const pay = new Pay(mockClient);

const CALLS: Array<[string, (id: string) => Promise<unknown>]> = [
  ['paymentIntents.retrieve', (id) => intents.retrieve(id)],
  ['paymentIntents.cancel', (id) => intents.cancel(id)],
  ['paymentIntents.confirm', (id) => intents.confirm(id, {} as never)],
  ['paymentIntents.complete', (id) => intents.complete(id)],
  ['paymentIntents.simulate', (id) => intents.simulate(id)],
  ['paymentIntents.update', (id) => intents.update(id, {} as never)],
  ['subscriptions.retrieve', (id) => subscriptions.retrieve(id)],
  ['subscriptions.update', (id) => subscriptions.update(id, {} as never)],
  ['subscriptions.cancel', (id) => subscriptions.cancel(id)],
  ['subscriptions.resume', (id) => subscriptions.resume(id)],
  ['subscriptions.listPaymentLinks', (id) => subscriptions.listPaymentLinks(id)],
  ['products.list (organization id)', (id) => products.list(id)],
  ['products.update (product id)', (id) => products.update('org_1', id, {} as never)],
  ['products.delete (product id)', (id) => products.delete('org_1', id)],
  ['prices.list (organization id)', (id) => prices.list(id)],
  ['prices.update (price id)', (id) => prices.update('org_1', id, {} as never)],
  ['prices.deactivate (price id)', (id) => prices.deactivate('org_1', id)],
  ['pay.get (slug)', (id) => pay.get(id)],
  ['pay.cancel (slug)', (id) => pay.cancel(id)],
];

describe('path segment safety (NODE-1)', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(CALLS)('NODE-1: %s refuses ids that change the request path', async (_name, call) => {
    for (const id of UNSAFE_IDS) {
      await expect(call(id), `id ${JSON.stringify(id)}`).rejects.toThrow();
    }
    const client = mockClient as unknown as Record<string, ReturnType<typeof vi.fn>>;
    for (const method of ['get', 'post', 'patch', 'delete']) {
      expect(client[method]).not.toHaveBeenCalled();
    }
  });

  it.each(CALLS)('%s still accepts a normal id', async (_name, call) => {
    await call('pi_123-abc_DEF');
    const client = mockClient as unknown as Record<string, ReturnType<typeof vi.fn>>;
    const calls = ['get', 'post', 'patch', 'delete'].map((m) => client[m].mock.calls.length);
    expect(calls.reduce((a, b) => a + b, 0)).toBe(1);
  });
});

/**
 * plan/security 2026-11-04 (NODE-2): the official webhook examples used the v1
 * `constructEvent`, which has no timestamp, so a captured delivery can be replayed forever.
 */
describe('webhook examples (NODE-2)', () => {
  it.fails.each(['webhook-express.ts', 'webhook-nextjs.ts'])(
    'NODE-2: examples/%s verifies the timestamped v2 signature',
    (file) => {
      const source = readFileSync(join(__dirname, '..', 'examples', file), 'utf8');
      expect(source).toContain('constructEventFromHeaders');
      expect(source).not.toMatch(/\.constructEvent\(/);
    }
  );
});
