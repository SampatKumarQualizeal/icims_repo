// src/pages/connect/connect-thank-you.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectThankYouPage
 * Connect Portal thank you/confirmation page after signup
 */
export class ConnectThankYouPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly heading: Div;
  readonly confirmationMessage: Div;
  readonly userName: Div;
  readonly dashboardLink: Link;
  readonly logoutLink: Link;
  
  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Thank You Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;
    
    // STEP 4: Instantiate components
    this.heading = new Div(
      page,
      contentFrame.getByRole('heading', { name: 'Welcome to your Dashboard' }),
      'Thank You Heading'
    );
    
    this.confirmationMessage = new Div(
      page,
      contentFrame.getByRole('heading', { name: 'Thank you for connecting with' }),
      'Confirmation Message'
    );
    
    this.userName = new Div(
      page,
      contentFrame.locator('.iCIMS_userMenuName'),
      'User Name Display'
    );
    
    this.dashboardLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Dashboard' }),
      'Dashboard Link'
    );
    
    this.logoutLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Log Out' }),
      'Logout Link'
    );
    
  }

  async expectLoaded() {
    await this.section('Connect Thank You Page - verify loaded', async () => {
      // await this.heading.expectVisible();
      await this.dashboardLink.expectVisible();
    });
  }

  async verifyConfirmationMessage() {
    await this.section('Verify confirmation message displayed', async () => {
      await this.confirmationMessage.expectVisible();
    });
  }

  async verifyUserName(expectedName: string) {
    await this.section(`Verify user name displayed: ${expectedName}`, async () => {
      await this.userName.expectVisible();
      const text = await this.userName.locator.textContent();
      if (!text?.includes(expectedName)) {
        throw new Error(`Expected user name to contain "${expectedName}", but found "${text}"`);
      }
    });
  }

  async clickDashboard() {
    await this.section('Navigate to dashboard', async () => {
      await this.dashboardLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickLogout() {
    await this.section('Logout from Connect Portal', async () => {
      await this.logoutLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
