import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';

/**
 * PipelineEditorModalPage
 */
export class PipelineEditorModalPage extends BasePage {
  readonly saveBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('.cdk-overlay-pane'), 'Pipeline Editor Modal');

    const saveBtnLoc: Locator = this.resolveLocator('button[name="Save"]');
    this.saveBtn = new Button(page, saveBtnLoc, 'Pipeline Save');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('PipelineEditor - expect loaded', async () => {
      await this.expectVisible(timeout);
      await this.saveBtn.expectVisible();
    });
  }

  async save() {
    await this.section('Save pipelines', async () => {
      await this.saveBtn.click();
    });
  }
}
