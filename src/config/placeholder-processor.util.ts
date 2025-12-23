/**
 * Placeholder processor for test data
 * 
 * Replaces template placeholders in JSON test data with generated values.
 * 
 * Supported patterns:
 * - {{alnum:N}} - Generate N-character alphanumeric string (e.g., {{alnum:10}} -> "aB3xYz9K2m")
 * - {{alpha:N}} - Generate N-character alphabetic string (e.g., {{alpha:6}} -> "AbCdEf")
 * - {{number:N}} - Generate N-digit number (e.g., {{number:4}} -> "8372")
 * - {{uuid}} - Generate UUID v4 (e.g., {{uuid}} -> "a3c5f8e2-...")
 * - {{fieldName}} - Reference another field value from the same data object
 * - {{fake.category.method}} - Use Faker.js for realistic data (see examples below)
 * 
 * Faker.js examples (v9+ API):
 * - {{fake.person.firstName}} -> "Alessandro"
 * - {{fake.person.lastName}} -> "Purdy"
 * - {{fake.person.fullName}} -> "Jane Doe"
 * - {{fake.internet.email}} -> "john.doe@example.com"
 * - {{fake.phone.number}} -> "555-123-4567"
 * - {{fake.location.city}} -> "San Francisco"
 * - {{fake.location.zipCode}} -> "94102"
 * - {{fake.company.name}} -> "Acme Corporation"
 * - {{fake.date.past}} -> "2024-03-15T10:30:00.000Z"
 * 
 * Full Faker.js API: https://fakerjs.dev/api/
 * 
 * Note: Values are cached per placeholder for consistency within the same data object.
 * Example: Using {{fake.person.firstName}} twice in the same object returns the same name.
 */

import { faker } from '@faker-js/faker';

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ALPHABETIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const NUMERIC = '0123456789';

/**
 * Generate random string from character set
 */
function randomString(chars: string, length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Process a single placeholder
 */
function processPlaceholder(placeholder: string, data: any, generatedValues: Map<string, string>): string {
  // Remove {{ and }}
  const content = placeholder.slice(2, -2).trim();

  // Check if we already generated this placeholder (for consistency across references)
  if (generatedValues.has(placeholder)) {
    return generatedValues.get(placeholder)!;
  }

  let result: string;

  // Format: {{fake.category.method}} - use Faker.js
  if (content.startsWith('fake.')) {
    const path = content.slice(5).split('.');
    try {
      // Navigate through faker object: fake.name.firstName -> faker.name.firstName()
      let fakerFn: any = faker;
      for (const segment of path) {
        fakerFn = fakerFn[segment];
      }
      
      // Call the faker function if it's a function, otherwise use the value
      result = typeof fakerFn === 'function' ? fakerFn() : String(fakerFn);
      
      // Remove phone extensions (x123, ext. 456, etc.)
      if (path.includes('phone')) {
        result = result.replace(/\s+(x|ext\.?)\s*\d+$/i, '').trim();
      }
    } catch (error) {
      console.warn(`Failed to resolve Faker.js path: ${content}. Falling back to random string.`);
      result = randomString(ALPHANUMERIC, 8);
    }
  }
  // Format: {{alnum:N}} - generate N-character alphanumeric string
  else if (content.startsWith('alnum:')) {
    const length = parseInt(content.split(':')[1], 10);
    result = randomString(ALPHANUMERIC, length);
  }
  // Format: {{alpha:N}} - generate N-character alphabetic string
  else if (content.startsWith('alpha:')) {
    const length = parseInt(content.split(':')[1], 10);
    result = randomString(ALPHABETIC, length);
  }
  // Format: {{number:N}} - generate N-digit number
  else if (content.startsWith('number:')) {
    const length = parseInt(content.split(':')[1], 10);
    result = randomString(NUMERIC, length);
  }
  // Format: {{uuid}} - generate UUID
  else if (content === 'uuid') {
    result = generateUUID();
  }
  // Variable reference: {{fieldName}} - reference another field value
  else {
    // Try to resolve from data object
    if (data && data[content] !== undefined && typeof data[content] === 'string') {
      result = data[content];
    } else {
      // If field doesn't exist yet, generate a default alphanumeric value
      result = randomString(ALPHANUMERIC, 8);
    }
  }

  // Cache the generated value for consistency
  generatedValues.set(placeholder, result);
  return result;
}

/**
 * Process all placeholders in a string value
 */
function processStringValue(value: string, data: any, generatedValues: Map<string, string>): string {
  const placeholderRegex = /\{\{[^}]+\}\}/g;
  return value.replace(placeholderRegex, (match) => processPlaceholder(match, data, generatedValues));
}

/**
 * Recursively process placeholders in an object
 * Processes strings and nested objects/arrays
 */
export function processPlaceholders(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Cache for generated values to ensure consistency
  const generatedValues = new Map<string, string>();

  function processValue(value: any): any {
    if (typeof value === 'string') {
      return processStringValue(value, data, generatedValues);
    }
    
    if (Array.isArray(value)) {
      return value.map(item => processValue(item));
    }
    
    if (value && typeof value === 'object') {
      const result: any = {};
      for (const key of Object.keys(value)) {
        result[key] = processValue(value[key]);
      }
      return result;
    }
    
    return value;
  }

  return processValue(data);
}
