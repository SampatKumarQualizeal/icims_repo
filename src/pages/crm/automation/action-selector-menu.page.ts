import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';

/**
 * ActionSelectorMenu
 */
export class ActionSelectorMenu extends BasePage {
  constructor(page: Page) {
    super(page, page.locator('body'), 'Action Selector Menu');
  }

  async choose(actionName: string) {
    await this.section(`Choose ${actionName}`, async () => {
      await this.page.getByRole('menuitem', { name: actionName }).click();
    });
  }
}
