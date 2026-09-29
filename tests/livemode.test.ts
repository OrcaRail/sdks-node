import { describe, it, expect } from 'vitest';
import { OrcaRail } from '../src';

describe('OrcaRail.livemode', () => {
  it('is false for sandbox (ak_test_) keys', () => {
    expect(new OrcaRail('ak_test_abc', 'sk_test_abc').livemode).toBe(false);
  });

  it('is true for live (ak_live_) keys', () => {
    expect(new OrcaRail('ak_live_abc', 'sk_live_abc').livemode).toBe(true);
  });
});
