import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { BasePage } from '@src/pages/base.page';

/**
 * AutomationListPage
 */
export class AutomationListPage extends BasePage {
  readonly createAutomationBtn: Button;
  readonly emptyAutomationBtn: Button;
  readonly searchInput: Input;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Automation List Page');

    const createAutomationBtnLoc: Locator = page.getByRole('button', { name: 'Create automation' });
    const emptyAutomationBtnLoc: Locator = page.getByRole('button', { name: 'Empty automation' });
    const searchInputLoc: Locator = this.resolveLocator('input[placeholder="Search"]');

    this.createAutomationBtn = new Button(page, createAutomationBtnLoc, 'Create automation');
    this.emptyAutomationBtn = new Button(page, emptyAutomationBtnLoc, 'Empty automation');
    this.searchInput = new Input(page, searchInputLoc, 'Automation search input');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('AutomationList - expect loaded', async () => {
      await this.expectVisible(timeout);
      await this.createAutomationBtn.expectVisible();
    });
  }

  async openCreateAutomationModal() {
    await this.section('Open Create Automation modal', async () => {
      await this.createAutomationBtn.click();
    });
  }

  async clickEmptyAutomationOption() {
    await this.section('Select Empty Automation', async () => {
      await this.emptyAutomationBtn.click();
    });
  }

  async getRowByName(name: string): Promise<Locator> {
    return this.resolveLocator(`.automation-row:has-text("${name}")`);
  }
}
