import { createHmac, timingSafeEqual } from 'crypto';
import { OrcaRailSignatureVerificationError } from './errors';
import type { WebhookEvent } from './types';

/** Header map as received, e.g. Node's IncomingHttpHeaders or a plain object. */
export type WebhookHeaders = Record<string, string | string[] | undefined>;

/** Default maximum age of a delivery, in seconds. */
export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300;

function headerValue(headers: WebhookHeaders, name: string): string {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';
}

function hexEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

/**
 * Webhook utilities for verifying webhook signatures
 */
export class Webhooks {
  /**
   * Verify webhook signature
   *
   * @param rawBody - Raw request body (string or Buffer)
   * @param signature - Signature from x-webhook-signature header
   * @param secret - API key secret (sk_live_...) used to verify the HMAC signature
   * @returns True if signature is valid, false otherwise
   */
  public verifySignature(rawBody: string | Buffer, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }

    // Convert rawBody to string if it's a Buffer
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    // Compute expected signature
    const expectedSignature = createHmac('sha256', secret).update(bodyString).digest('hex');

    // Compare signatures using timing-safe comparison
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Length check first (prevents timing attacks)
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  /**
   * Construct and verify a webhook event from raw body and signature
   *
   * @param rawBody - Raw request body (string or Buffer)
   * @param signature - Signature from x-webhook-signature header
   * @param secret - API key secret (sk_live_...) used to verify the HMAC signature
   * @returns Parsed webhook event
   * @throws OrcaRailSignatureVerificationError if signature is invalid
   */
  public constructEvent(rawBody: string | Buffer, signature: string, secret: string): WebhookEvent {
    if (!this.verifySignature(rawBody, signature, secret)) {
      throw new OrcaRailSignatureVerificationError(
        'Webhook signature verification failed. The signature does not match the expected signature.',
        signature
      );
    }

    // Parse JSON body
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    try {
      const event = JSON.parse(bodyString) as WebhookEvent;
      return event;
    } catch (error) {
      throw new OrcaRailSignatureVerificationError(
        `Failed to parse webhook body: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify a delivery with its timestamped (v2) signature and parse it. Rejects
   * deliveries older than `toleranceSeconds`, so a captured webhook cannot be
   * replayed later. Prefer this over `constructEvent`.
   *
   * @param rawBody - Raw request body (string or Buffer), unparsed
   * @param headers - Request headers (needs x-webhook-timestamp and x-webhook-signature-v2)
   * @param secret - API key secret used to sign webhooks
   * @throws OrcaRailSignatureVerificationError if the signature is missing, wrong or too old
   */
  public constructEventFromHeaders(
    rawBody: string | Buffer,
    headers: WebhookHeaders,
    secret: string,
    options: { toleranceSeconds?: number; now?: number } = {}
  ): WebhookEvent {
    const timestamp = headerValue(headers, 'x-webhook-timestamp');
    const signature = headerValue(headers, 'x-webhook-signature-v2');
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const tolerance = options.toleranceSeconds ?? DEFAULT_WEBHOOK_TOLERANCE_SECONDS;
    const now = options.now ?? Math.floor(Date.now() / 1000);

    if (!secret || !/^\d+$/.test(timestamp) || !signature) {
      throw new OrcaRailSignatureVerificationError(
        'Webhook is missing the x-webhook-timestamp or x-webhook-signature-v2 header.',
        signature
      );
    }
    if (Math.abs(now - Number(timestamp)) > tolerance) {
      throw new OrcaRailSignatureVerificationError(
        'Webhook timestamp is outside the allowed tolerance (possible replay).',
        signature
      );
    }
    const expected = createHmac('sha256', secret).update(`${timestamp}.${bodyString}`).digest('hex');
    if (!hexEquals(signature, expected)) {
      throw new OrcaRailSignatureVerificationError(
        'Webhook signature verification failed. The signature does not match the expected signature.',
        signature
      );
    }

    try {
      return JSON.parse(bodyString) as WebhookEvent;
    } catch (error) {
      throw new OrcaRailSignatureVerificationError(
        `Failed to parse webhook body: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
