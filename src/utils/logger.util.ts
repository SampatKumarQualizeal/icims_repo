import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';

// NEW IMPORTS — dynamic redaction & value scrubbing
import {
  sanitizeObject,
  sanitizeString,
  safeJsonStringify
} from './sanitizer.util';

export type LogLevel = 'info' | 'debug' | 'warn' | 'error';

export interface LoggerOptions {
  testId: string;
  testOutputDir: string;
  toConsole?: boolean;
  context?: string;
}

export class Logger {
  private logFile: string;
  private toConsole: boolean;
  private context: string;
  private options: LoggerOptions;

  constructor(opts: LoggerOptions) {
    this.toConsole = opts.toConsole ?? true;
    this.context = opts.context ?? 'general';
    this.options = { ...opts };

    this.logFile = path.join(opts.testOutputDir, `test-${opts.testId}.log`);
    fs.mkdirSync(opts.testOutputDir, { recursive: true });
    fs.writeFileSync(this.logFile, '');
  }

  /**
   * 🔐 Unified write() method with full sanitization
   */
  private write(level: LogLevel, message: string, data?: any) {
    const safeMessage = sanitizeString(message);

    const safeData =
      typeof data === 'string'
        ? sanitizeString(data)
        : sanitizeObject(data);

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message: safeMessage,
      data: safeData
    };

    // Write sanitized log entry
    fs.appendFileSync(this.logFile, JSON.stringify(payload) + '\n');

    // Optional console — also sanitized
    if (this.toConsole) {
      const out = `[${level.toUpperCase()}] ${safeMessage}`;
      if (level === 'error') console.error(out, safeData ?? '');
      else console.log(out, safeData ?? '');
    }
  }

  // Public log-level helpers
  info(msg: string, data?: any) { this.write('info', msg, data); }
  debug(msg: string, data?: any) { this.write('debug', msg, data); }
  warn(msg: string, data?: any) { this.write('warn', msg, data); }
  error(msg: string, data?: any) { this.write('error', msg, data); }

  /**
   * 🔒 Safe section wrapper — no double execution, redacted title, safe failure handling
   */
  async section<T>(title: string, fn: () => Promise<T>): Promise<T> {
    const safeTitle = sanitizeString(title);

    return await test.step(safeTitle, async () => {
      try {
        return await fn();
      } catch (err) {
        this.error(`Section failed: ${safeTitle}`, err);
        throw err; // Critical: ensures correct Playwright step failure
      }
    });
  }

  /**
   * Creates a child logger inheriting current config
   */
  child(overrides: Partial<LoggerOptions>): Logger {
    return new Logger({
      ...this.options,
      ...overrides,
      context: overrides.context ?? this.context,
      toConsole: this.toConsole
    });
  }
}
