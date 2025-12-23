// src/components/mat-menu.component.ts

import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@src/components/base.component';

export class MatMenu extends BaseComponent {

  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async open(execOptions?: { annotate?: boolean }) {
    return this.exec(
      'Open MatMenu',
      async (loc) => {
        await loc.click();
      },
      execOptions
    );
  }

  async selectItemByName(
    name: string,
    execOptions?: { annotate?: boolean }
  ) {
    return this.exec(
      `Select menu item: ${name}`,
      async () => {
        await this.page.getByRole('menuitem', { name }).click();
      },
      execOptions
    );
  }
}
