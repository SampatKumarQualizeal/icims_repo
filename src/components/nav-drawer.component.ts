import { Page, Locator } from '@playwright/test';
import { Button } from './button.component';
import { getExecutionProfile } from '@src/utils/execution-profile.util';

export class NavDrawerComponent {
  readonly page: Page;
  readonly root: Locator;
  private toggleButton: Button;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('.MuiDrawer-paperAnchorTop'); // drawer container
    this.toggleButton = new Button(page, page.locator('#mobile-menu-toggle'), 'Mobile Menu Toggle');
  }

  async open() {
    const profile = getExecutionProfile();
    await this.toggleButton.click();
    await this.root.waitFor({ state: 'visible', timeout: profile.timeouts.modal });
  }

  async navigateTo(item: 'Create' | 'Search' | 'Report' | 'Admin' | 'Library' | 'Communicate') {
    await this.open();
    const profile = getExecutionProfile();
    const navButton = new Button(
      this.page, 
      this.page.locator(`nav .MuiListItemButton-root#${item}`),
      `Nav: ${item}`
    );
    await navButton.click({ timeout: profile.timeouts.component });
  }
}
