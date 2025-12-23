import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Toast extends BaseComponent {
  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async expectMessageContains(
    text: string,
    timeout = 4000,
    options?: { annotate?: boolean; retries?: number }
  ) {
    return this.exec(
      `Toast Contains ("${text}")`,
      async (loc) => {
        await loc.getByText(text).waitFor({ timeout });
      },
      options
    );
  }
}
