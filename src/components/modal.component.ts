// src/components/modal.component.ts

import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Modal extends BaseComponent {

  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async expectOpen(execOptions?: { annotate?: boolean; retries?: number }) {
    return this.exec(
      'Modal Open',
      async (loc) => {
        await loc.waitFor({ state: 'visible' });
      },
      execOptions
    );
  }

  async close(execOptions?: { annotate?: boolean; retries?: number }) {
    return this.exec(
      'Modal Close',
      async (loc) => {
        await loc.locator('.close, [aria-label=Close]').click();
      },
      execOptions
    );
  }
}
