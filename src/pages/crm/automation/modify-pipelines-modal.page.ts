import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';

/**
 * ModifyPipelinesModalPage
 */
export class ModifyPipelinesModalPage extends BasePage {
  readonly saveBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Modify Pipelines Modal');

    const saveBtnLoc: Locator = page.getByRole('button', { name: 'Save' });
    this.saveBtn = new Button(page, saveBtnLoc, 'Modify Pipelines Save');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('ModifyPipelines - expect loaded', async () => {
      await this.saveBtn.expectVisible();
    });
  }

  async save() {
    await this.section('Save pipeline changes', async () => {
      await this.saveBtn.click();
    });
  }
}
