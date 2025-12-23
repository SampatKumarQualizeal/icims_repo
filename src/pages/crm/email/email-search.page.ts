import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { Label } from '@src/components/label.component';
import { BasePage } from '@src/pages/base.page';

/**
 * EmailSearchPage
 */
export class EmailSearchPage extends BasePage {
  readonly emailSearchBtn: Button;
  readonly header: Label;
  readonly automatedCampaignsTab: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Email Search Page');

    const emailSearchBtnLoc: Locator = this.resolveLocator('button[name="Email search"]');
    const headerLoc: Locator = this.resolveLocator('h1:has-text("Email search")');
    const automatedCampaignsTabLoc: Locator = page.locator('//a[@role="tab"][contains(.,"Automated campaigns")]');

    this.emailSearchBtn = new Button(page, emailSearchBtnLoc, 'Email search button');
    this.header = new Label(page, headerLoc, 'Email search header');
    this.automatedCampaignsTab = new Button(page, automatedCampaignsTabLoc, 'Automated campaigns tab');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('EmailSearch - expect loaded', async () => {
      await this.header.expectVisible();
      await this.automatedCampaignsTab.expectVisible();
    });
  }

  async goToAutomatedCampaigns() {
    await this.section('Navigate to Automated campaigns tab', async () => {
      await this.automatedCampaignsTab.click();
    });
  }
}
