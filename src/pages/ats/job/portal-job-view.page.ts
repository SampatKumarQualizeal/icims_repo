import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';

/**
 * PortalJobViewPage
 * Represents the external job view opened in a *new tab*.
 *
 * This tab contains its own iframe: iframe[name="icims_content_iframe"]
 */
export class PortalJobViewPage extends BasePage {

  readonly welcomeLink: Button;

  constructor(page: Page) {

    // STEP 1: Resolve job portal iframe
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');

    // STEP 2: Use iframe body as root
    super(page, contentFrame.locator('body'), 'Portal Job View');

    // STEP 3: Resolve locators
    const welcomeLinkLoc: Locator = contentFrame.getByText('Welcome page Returning');

    // STEP 4: Instantiate components
    this.welcomeLink = new Button(page, welcomeLinkLoc, 'Welcome Page Returning Link');
  }

  async expectLoaded() {
    await this.section('Portal Job View - verify loaded', async () => {
      await this.welcomeLink.expectVisible();
    });
  }

  async openWelcomePage() {
    await this.welcomeLink.click();
  }
}
