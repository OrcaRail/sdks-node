import { OrcaRailError } from './errors';

/**
 * One URL path segment built from a caller-supplied id or slug. Ids often come from request
 * input (`?payment_intent=`), so values that would change the request path (blank, `.`, `..`,
 * `/`, `\`, `?`, `#`, NUL) are refused instead of sent. Everything else is percent-encoded,
 * which also turns `%2e%2e` into a literal segment.
 */
export function pathSegment(value: string, name: string = 'id'): string {
  const text = String(value ?? '');
  if (text.trim() === '' || text === '.' || text === '..' || /[/\\?#\0]/.test(text)) {
    throw new OrcaRailError(`Invalid ${name}: it must be a single URL path segment`);
  }
  return encodeURIComponent(text);
}
