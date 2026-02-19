/**
 * Base error class for all OrcaRail errors
 */
export class OrcaRailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrcaRailError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when the API returns a non-2xx status code
 */
export class OrcaRailAPIError extends OrcaRailError {
  /**
   * HTTP status code
   */
  public readonly statusCode: number;

  /**
   * Error type from the API response
   */
  public readonly type?: string;

  /**
   * Additional error details from the API
   */
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, type?: string, details?: unknown) {
    super(message);
    this.name = 'OrcaRailAPIError';
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class OrcaRailAuthenticationError extends OrcaRailAPIError {
  constructor(message: string = 'Authentication failed. Please check your API key and secret.') {
    super(message, 401, 'authentication_error');
    this.name = 'OrcaRailAuthenticationError';
  }
}

/**
 * Error thrown when webhook signature verification fails
 */
export class OrcaRailSignatureVerificationError extends OrcaRailError {
  /**
   * The signature that was provided
   */
  public readonly signature: string;

  constructor(message: string = 'Webhook signature verification failed', signature?: string) {
    super(message);
    this.name = 'OrcaRailSignatureVerificationError';
    this.signature = signature || '';
  }
}
