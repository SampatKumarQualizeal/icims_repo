import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Label } from '@src/components/label.component';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

export class CrmDashboardPage extends BasePage {
  readonly header: Label;
  readonly sideNav: Locator;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Dashboard Page');

    const headerLoc: Locator = page.getByRole('heading', { name: 'Dashboard' });

    this.header = new Label(page, headerLoc, 'Dashboard Header');
    this.sideNav = page.getByLabel('Sidebar navigation');
  }

  async goToSideNav(menuItem: string) {
    await this.section(`Click ${menuItem} on CRM Dashboard Side Navigation`, async () => {
      await new Button(this.page, this.page.getByRole('button', { name: menuItem }), `${menuItem} Side Nav Link`).clickAndWaitForNavigation();
    });
  }

  async expectLoaded(timeout = 10_000) {
    await this.section('CRM Dashboard - expect loaded', async () => {
      await this.header.expectVisible(timeout);
    });
  }
}
