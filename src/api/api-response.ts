// src/api/api-response.ts
import { test } from '@tests/governance';
import {
  sanitizeObject,
  sanitizeString,
  safeJsonStringify
} from '@src/utils/sanitizer.util';

export class ApiResponseWrapper {
  constructor(
    private status: number,
    private body: any,
    private meta: { method: string; url: string }
  ) {}

  as<T>(): T {
    return this.body as T;
  }

  statusCode() {
    return this.status;
  }

  isSuccess() {
    return this.status >= 200 && this.status < 300;
  }

  /**
   * Attach sanitized response to the Playwright test report.
   */
  async attach() {
    // Sanitize filename (URLs can contain tokens)
    const safeFileName = sanitizeString(
      `api-${this.meta.method}-${this.meta.url}`
    )
      .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
      .slice(0, 200) + '.json';

    // Sanitize body + meta
    const safeBody =
      typeof this.body === 'string'
        ? sanitizeString(this.body)
        : sanitizeObject(this.body);

    const safeMeta = sanitizeObject(this.meta);

    const payload = {
      status: this.status,
      body: safeBody,
      meta: safeMeta
    };

    try {
      return await test.info().attach(safeFileName, {
        body: safeJsonStringify(payload),
        contentType: 'application/json'
      });
    } catch {
      return; // safe fallback
    }
  }
}