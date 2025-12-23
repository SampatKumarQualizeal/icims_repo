import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Button extends BaseComponent {

  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async click(
    pwOptions?: Parameters<Locator['click']>[0],
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return await this.exec(
      'Click',
      async (loc) => {
        await loc.click({
          timeout: 10_000,
          ...pwOptions
        });
      },
      execOptions
    );
  }

  async clickAndWaitForNavigation(execOptions?: { annotate?: boolean }) {
    return await this.exec(
      'Click and Wait for Navigation',
      async (loc) => {
        await Promise.all([
          loc.click(),
          this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        ]);
      },
      execOptions
    );
  }
}
