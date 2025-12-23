import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';

/**
 * ArchiveAutomationModalPage
 */
export class ArchiveAutomationModalPage extends BasePage {
  readonly archiveBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Archive Automation Modal');

    const archiveBtnLoc: Locator = page.getByRole('button', { name: 'Archive', exact: true });
    this.archiveBtn = new Button(page, archiveBtnLoc, 'Archive confirmation');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('Archive modal - expect loaded', async () => {
      await this.expectVisible(timeout);
      await this.archiveBtn.expectVisible();
    });
  }

  async confirmArchive() {
    await this.section('Confirm archive', async () => {
      await this.archiveBtn.click();
    });
  }
}
