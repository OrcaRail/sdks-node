import { createHmac, timingSafeEqual } from 'crypto';
import { OrcaRailSignatureVerificationError } from './errors';
import type { WebhookEvent } from './types';

/**
 * Webhook utilities for verifying webhook signatures
 */
export class Webhooks {
  /**
   * Verify webhook signature
   *
   * @param rawBody - Raw request body (string or Buffer)
   * @param signature - Signature from x-webhook-signature header
   * @param secret - Webhook secret (API key's secretHash)
   * @returns True if signature is valid, false otherwise
   */
  public verifySignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      return false;
    }

    // Convert rawBody to string if it's a Buffer
    const bodyString =
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    // Compute expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

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
   * @param secret - Webhook secret (API key's secretHash)
   * @returns Parsed webhook event
   * @throws OrcaRailSignatureVerificationError if signature is invalid
   */
  public constructEvent(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): WebhookEvent {
    if (!this.verifySignature(rawBody, signature, secret)) {
      throw new OrcaRailSignatureVerificationError(
        'Webhook signature verification failed. The signature does not match the expected signature.',
        signature
      );
    }

    // Parse JSON body
    const bodyString =
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    try {
      const event = JSON.parse(bodyString) as WebhookEvent;
      return event;
    } catch (error) {
      throw new OrcaRailSignatureVerificationError(
        `Failed to parse webhook body: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
