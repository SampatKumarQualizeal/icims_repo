import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';

/**
 * ConfirmModalPage
 */
export class ConfirmModalPage extends BasePage {
  readonly confirmBtn: Button;

  constructor(page: Page, confirmButtonName = 'Confirm') {
    super(page, page.locator('.cdk-overlay-pane'), 'Confirm Modal');

    const confirmBtnLoc: Locator = this.resolveLocator(`button[name="${confirmButtonName}"]`);
    this.confirmBtn = new Button(page, confirmBtnLoc, 'Confirm');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('Confirm modal - expect loaded', async () => {
      await this.expectVisible(timeout);
      await this.confirmBtn.expectVisible();
    });
  }

  async confirm() {
    await this.section('Confirm modal action', async () => {
      await this.confirmBtn.click();
    });
  }
}
