// src/utils/secret-keys.util.ts

/**
 * Pulls secret names dynamically from environment variables.
 * Matches any variable name containing secret-like keywords.
 */
export function getDynamicSecretKeys(): string[] {
  return Object.keys(process.env)
    .filter(key =>
      /(secret|password|token|key|auth|session|cookie)/i.test(key)
    )
    .map(k => k.toLowerCase());
}

let externalSecretValues: string[] = [];

export function registerExternalSecrets(secrets: Record<string, any>) {
  const values: string[] = [];

  for (const [key, value] of Object.entries(secrets)) {
    if (typeof value === 'string') {
      values.push(value);
    } else if (typeof value === 'object' && value !== null) {
      // flatten nested structures
      extractValues(value, values);
    }
  }

  externalSecretValues = values;
}

function extractValues(obj: any, bucket: string[]) {
  for (const [key, val] of Object.entries(obj)) {
    // Only extract if the key suggests it's sensitive data (exclude username)
    if (typeof val === 'string' && /password|pass|pwd|token|secret|key|webhook|apikey|api_key/i.test(key)) {
      bucket.push(val);
    }
    if (typeof val === 'object' && val !== null) {
      extractValues(val, bucket);
    }
  }
}

export function getKnownSecretValues(): string[] {
  const values: string[] = [];

  // pull env secrets if they exist
  for (const [key, value] of Object.entries(process.env)) {
    if (/(secret|password|token|key|auth|session|cookie)/i.test(key)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        values.push(value);
      }
    }
  }

  // include externally registered secrets
  return [...new Set([...values, ...externalSecretValues])];
}
