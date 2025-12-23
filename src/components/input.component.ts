// src/components/input.component.ts
import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base.component';
import { sanitizeString } from '@src/utils/sanitizer.util';

export class Input extends BaseComponent {
  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async fill(value: string, execOptions?: { retries?: number; annotate?: boolean }) {
    const masked = sanitizeString(value);

    return this.exec(
      `Fill (${masked})`,
      async (loc) => {
        // Real value goes to browser, never to logs
        await loc.fill(value);
      },
      execOptions
    );
  }

  async type(value: string, delay = 50, execOptions?: { annotate?: boolean }) {
    const masked = sanitizeString(value);

    return this.exec(
      `Type (${masked})`,
      async (loc) => {
        await loc.type(value, { delay });
      },
      execOptions
    );
  }
  
  async inputValue(execOptions?: { annotate?: boolean }) {
    let result = '';

    await this.exec(
      'Get Input Value',
      async (loc) => {
        result = await loc.inputValue();
      },
      execOptions
    );

    return result;
  }

  async clear(execOptions?: { annotate?: boolean }) {
    return this.exec(
      'Clear',
      async (loc) => {
        await loc.fill('');
      },
      execOptions
    );
  }
}
