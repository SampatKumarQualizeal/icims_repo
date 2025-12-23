// src/components/link.component.ts

import { expect, Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Link extends BaseComponent {

  constructor(page: Page, selectorOrLocator: string | Locator, name: string) {
    super(page, selectorOrLocator, name);
  }

  /** Normal click + wait for DOM content loaded */
  async click(
    pwOptions?: Parameters<Locator['click']>[0],
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Click link`,
      async (loc) => {
        await Promise.all([
          this.page.waitForLoadState('domcontentloaded'),
          loc.click(pwOptions)
        ]);
      },
      execOptions
    );
  }

  /** Raw textContent retrieval */
  async textContent() {
    let text: string | null = null;

    await this.exec(`Get text content`, async (loc) => {
      text = await loc.textContent();
    });

    return text;
  }

  /** Navigate and wait for full network idle */
  async navigateAndWait(
    pwOptions?: Parameters<Locator['click']>[0],
    execOptions?: { annotate?: boolean }
  ) {
    return this.exec(
      `Navigate via link`,
      async (loc) => {
        await Promise.all([
          this.page.waitForLoadState('networkidle'),
          loc.click(pwOptions)
        ]);
      },
      execOptions
    );
  }

  /** Open in new tab and return Page instance */
  async openNewTab(): Promise<Page> {
    return this.exec(`Open new tab`, async (loc) => {
      const newPagePromise = this.page.context().waitForEvent('page');

      await loc.click({ button: 'middle' }).catch(() =>
        loc.click()
      );

      return await newPagePromise;
    });
  }

  /** Validate href attribute */
  async expectHref(expected: string | RegExp) {
    return this.exec(`Expect href`, async (loc) => {
      await expect(loc).toHaveAttribute('href', expected);
    });
  }

  async expectVisible() {
    return super.expectVisible();
  }
}
