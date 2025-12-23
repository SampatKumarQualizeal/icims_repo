// src/api/api-client.ts
import { randomUUID } from 'crypto';
import { APIRequestContext, request, test } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';
import {
  sanitizeObject,
  sanitizeString,
  safeJsonStringify
} from '@src/utils/sanitizer.util';
import { ApiResponseWrapper } from './api-response';

export class ApiClient {
  private logger: Logger;
  private baseUrl: string;
  private token: string | null = null;
  private context: APIRequestContext | null = null;

  private customHeaders: Record<string, string> = {};

  constructor(baseUrl: string, logger: Logger) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  setHeaders(headers: Record<string, string>) {
    this.customHeaders = {
      ...this.customHeaders,
      ...headers,
    };
    this.context = null;
  }

  private async getContext(includeAuth = true): Promise<APIRequestContext> {
    if (this.context) return this.context;

    const headers: Record<string, string> = {};

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    Object.assign(headers, this.customHeaders);

    // SANITIZE HEADERS BEFORE LOGGING ANYTHING
    const safeHeaders = sanitizeObject(headers);
    this.logger.debug('[API] Building request context', safeHeaders);

    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: headers, // raw headers go to Playwright, not logs
    });

    return this.context;
  }

  async authenticate(username: string, password: string) {
    this.logger.section('[API] authenticate()', async () => {
      // Only log non-sensitive fields
      this.logger.info('[API] authenticate() called', { username });

      const ctx = await this.getContext(false);

      const resp = await ctx.post('/auth/token', {
        data: { username, password },
      });

      if (!resp.ok()) {
        this.logger.error('[API] Auth failed', { status: resp.status() });
        throw new Error(`API Authentication failed: ${resp.status()}`);
      }

      const data = await resp.json();

      // token sanitized automatically in logger
      this.token = data.token;
      this.context = null;

      this.logger.info('[API] Auth successful', { status: resp.status() });
    });
  }

  async get(url: string, options: any = {}) {
    return this.execute('GET', url, options);
  }
  async post(url: string, data: any, options: any = {}) {
    return this.execute('POST', url, { ...options, data });
  }
  async patch(url: string, data: any, options: any = {}) {
    return this.execute('PATCH', url, { ...options, data });
  }
  async put(url: string, data: any, options: any = {}) {
    return this.execute('PUT', url, { ...options, data });
  }
  async delete(url: string, options: any = {}) {
    return this.execute('DELETE', url, options);
  }

  private async execute(method: string, endpoint: string, options: any) {
    return await this.logger.section(`[API] ${method} ${endpoint}`, async () => {
      const ctx = await this.getContext(true);

      const requestId = randomUUID();
      const callStack = (new Error('call stack'))
        .stack?.split('\n')
        .slice(1, 8)
        .join('\n');

      // Safe sanitized logging of request
      this.logger.debug(`[API] REQUEST_START ${requestId}`, {
        method,
        endpoint,
        ts: Date.now(),
        data: sanitizeObject(options?.data),
        stack: sanitizeString(callStack),
      });

      const resp = await ctx.fetch(endpoint, {
        method,
        ...options,
      });

      const status = resp.status();

      let body: any;
      try {
        body = await resp.json();
      } catch {
        body = await resp.text();
      }

      // Safe sanitized request-end log
      this.logger.debug(`[API] REQUEST_END ${requestId}`, {
        status,
        ts: Date.now(),
      });

      // Wrap sanitized data
      const wrapper = new ApiResponseWrapper(status, body, {
        method,
        url: endpoint,
      });

      // 👇 SANITIZED attachment into Playwright report
      await test.info().attach(`API Response - ${method} ${endpoint}`, {
        body: safeJsonStringify({
          method,
          endpoint,
          status,
          body: sanitizeObject(body),
        }),
        contentType: 'application/json',
      });

      if (!resp.ok()) {
        this.logger.error(`[API] ERROR ${method} ${endpoint}`, {
          status,
          body: sanitizeObject(body),
        });
      } else {
        this.logger.info(`[API] OK ${method} ${endpoint}`, { status });
      }

      return wrapper;
    });
  }
  // -------------------------
  // CLEANUP: release Playwright request context to avoid leaks
  // -------------------------
  dispose() {
    try {
      this.logger.info('[API] dispose() called');

      if (this.context) {
        // APIRequestContext.dispose returns Promise<void>
        // call and ignore failures
        this.context.dispose().catch(() => {});
      }
    } catch (err) {
      this.logger.error('[API] dispose() failed', { err });
    } finally {
      this.context = null;
    }
  }
}
