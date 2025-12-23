
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';

export class DashboardPage extends BasePage {
  readonly createBtn: Button;
  readonly quickSearchInputSelector = '#quicksearch input, input[placeholder*="Quick search"]';

  constructor(page: Page) {
    const frame = page.frameLocator('iframe[name="main_body"]');
    super(page, frame.locator('#dashboard'), 'Dashboard Page');

    this.frameLocator = frame;
    this.createBtn = new Button(page, frame.locator('button#create, button[data-testid="create"], button#create-button'), 'Create Button');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('Dashboard loaded', async () => {
      await this.expectVisible(timeout);
      await this.createBtn.expectVisible();
    });
  }

  async openCreate() {
    await this.section('Open Create menu', async () => {
      await this.createBtn.click();
    });
  }
}
