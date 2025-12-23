// src/utils/sanitizer.util.ts
import { config } from '@config/config';

// Define types for secrets
interface Secrets {
  [key: string]: string | undefined;
}

declare global {
  namespace globalThis {
    var secrets: Secrets | undefined;
  }
}
/**
 * STATIC keywords we always treat as sensitive.
 * Dynamic secrets from environment variables get merged with these.
 */
const STATIC_SECRET_KEYS = [
  'password',
  'pass',
  'pwd',
  'token',
  'id_token',
  'access_token',
  'refresh_token',
  'client_secret',
  'authorization',
  'apikey',
  'api_key',
  'secret',
  'session',
  'cookie'
];

const REDACTED = '***REDACTED***';
/**
 * Collect dynamic secret keys from environment variables.
 * Example: ACCESS_TOKEN, ICIMS_CLIENT_SECRET, AWS_SECRET_ACCESS_KEY, SESSION_ID
 */
function getDynamicSecretKeys(): string[] {
  return Object.keys(process.env)
    .filter(key =>
      /(secret|password|token|key|auth|session|cookie)/i.test(key)
    )
    .map(k => k.toLowerCase());
}
/**
 * Merge static + dynamic secret keys
 */
function getAllSecretKeys(): string[] {
  return Array.from(
    new Set([
      ...STATIC_SECRET_KEYS.map(k => k.toLowerCase()),
      ...getDynamicSecretKeys()
    ])
  );
}

/**
 * Build list of actual secret values (so we can redact their occurrences).
 * Includes both environment variables and loaded secrets.
 */
function getKnownSecretValues(): string[] {
  const values: string[] = [];

  // Check environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (/(secret|password|token|key|auth|session|cookie)/i.test(key)) {
      if (value && typeof value === 'string' && value.trim().length > 0) {
        values.push(value);
      }
    }
  }

  // Check loaded secrets
  if (globalThis.secrets) {
    extractSecretValues(globalThis.secrets, values);
  }

  // Check config secrets
  if (config.secrets) {
    extractSecretValues(config.secrets, values);
  }

  return values;
}

/**
 * Recursively extract only sensitive values from secrets object.
 * Excludes usernames and other non-sensitive identifiers.
 */
function extractSecretValues(obj: any, bucket: string[]) {
  if (!obj || typeof obj !== 'object') return;

  for (const [key, val] of Object.entries(obj)) {
    // Only extract if the key suggests it's sensitive data (exclude username)
    if (typeof val === 'string' && /password|pass|pwd|token|secret|key|webhook|apikey|api_key/i.test(key)) {
      if (val.trim().length > 0) {
        bucket.push(val);
      }
    }
    if (typeof val === 'object' && val !== null) {
      extractSecretValues(val, bucket);
    }
  }
}

// Token scrubbing regexes
const tokenScrubbers = [
  [/(Bearer\s+)[A-Za-z0-9\-\._]+/gi, '$1' + REDACTED],
  [/(token=)[^&]+/gi, '$1' + REDACTED],
  [/(password=)[^&]+/gi, '$1' + REDACTED],
  [/("authorization"\s*:\s*")([^"]+)(")/gi, `$1${REDACTED}$3`],
  [/("cookie"\s*:\s*")([^"]+)(")/gi, `$1${REDACTED}$3`],
  // JWT-like tokens
  [/eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g, REDACTED]
];

/**
 * Generic string sanitizer:
 * - Redacts token-like patterns
 * - Redacts any secret values from environment variables
 */
export function sanitizeString(value: string | undefined | null): string {
  if (!value) return '';

  let result = value;

  for (const [regex, replacement] of tokenScrubbers) {
    result = result.replace(regex as RegExp, replacement as string);
  }

  // Remove values that match known secrets
  for (const secret of getKnownSecretValues()) {
    if (!secret) continue;
    const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), REDACTED);
  }

  return result;
}

/**
 * Recursively sanitize objects to remove sensitive fields and values.
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const SECRET_KEYS = getAllSecretKeys();

  // Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const clean: any = {};

  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    const value = obj[key];

    // If key matches secret key → redact
    if (SECRET_KEYS.some(k => lower.includes(k))) {
      clean[key] = REDACTED;
      continue;
    }

    if (typeof value === 'object') {
      clean[key] = sanitizeObject(value);
      continue;
    }

    if (typeof value === 'string') {
      clean[key] = sanitizeString(value);
      continue;
    }

    clean[key] = value;
  }

  return clean;
}

/**
 * Safe JSON.stringify that applies sanitization.
 */
export function safeJsonStringify(obj: any): string {
  return JSON.stringify(sanitizeObject(obj), null, 2);
}

