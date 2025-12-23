import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@src/components/base.component';

export class FileInput extends BaseComponent {
  constructor(page: Page, locator: string | Locator, friendlyName: string) {
    super(page, locator, friendlyName);
  }

  async setFiles(
    files: string | string[],
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Set Files`,
      async (loc) => {
        await loc.setInputFiles(files);
      },
      execOptions
    );
  }
}
