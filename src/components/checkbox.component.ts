import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Checkbox extends BaseComponent {

  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async check(execOptions?: { retries?: number; annotate?: boolean }) {
    return this.exec(
      'Check',
      async (loc) => loc.check({ timeout: 10_000 }),
      execOptions
    );
  }

  async uncheck(execOptions?: { retries?: number; annotate?: boolean }) {
    return this.exec(
      'Uncheck',
      async (loc) => loc.uncheck({ timeout: 10_000 }),
      execOptions
    );
  }

  async toggle(execOptions?: { retries?: number; annotate?: boolean }) {
    return this.exec(
      'Toggle',
      async (loc) => loc.click({ timeout: 10_000 }),
      execOptions
    );
  }

  async isChecked(execOptions?: { annotate?: boolean }) {
    return this.exec(
      'Assert Checked',
      async (loc) => expect(loc).toBeChecked(),
      execOptions
    );
  }

  async isUnchecked(execOptions?: { annotate?: boolean }) {
    return this.exec(
      'Assert Unchecked',
      async (loc) => expect(loc).not.toBeChecked(),
      execOptions
    );
  }
}
