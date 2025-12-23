// src/pages/connect/connect-dashboard.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectDashboardPage
 * Connect Portal dashboard page
 */
export class ConnectDashboardPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly welcomeMessage: Div;
  readonly generalOptionsBtn: Button;
  readonly logoutLink: Link;
  readonly updateProfileLink: Link;
  readonly viewJobsLink: Link;
  readonly screeningQuestionsLink: Link;
  readonly emailSubscriptionsLink: Link;
  readonly userNameLbl:Div;


  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');

    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Dashboard Page');

    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;

    // STEP 4: Instantiate components
    this.userNameLbl = new Div(page, 
      contentFrame.locator('.iCIMS_userMenuName'),
      "User Name Label");

    this.welcomeMessage = new Div(page,
      contentFrame.getByRole('heading', { name: 'Welcome to your Dashboard' }),
      'Welcome Message'
    );

    this.generalOptionsBtn = new Button(page,
      contentFrame.getByRole('heading', { name: 'General Options' }),
      'General Options Button'
    );

    this.logoutLink = new Link(page,
      contentFrame.getByRole('link', { name: 'Log Out' }),
      'Logout Link'
    );

    this.updateProfileLink = new Link(page,
      this.frameLocator!.getByRole('link', { name: 'Update your profile' }),
      'Update Profile Link'
    );

    this.viewJobsLink = new Link(page,
      this.frameLocator!.getByRole('link', { name: 'View current job opportunities' }),
      'View Jobs Link'
    );

    this.screeningQuestionsLink = new Link(page,
      this.frameLocator!.getByRole('link', { name: 'Update your person screening' }),
      'Screening Questions Link'
    );

    this.emailSubscriptionsLink = new Link(page,
      this.frameLocator!.getByRole('link', { name: 'Manage your email' }),
      'Email Subscriptions Link'
    );
  }

  async expectLoaded() {
    await this.section('Connect Dashboard Page - verify loaded', async () => {
      await this.welcomeMessage.expectVisible();
      await this.generalOptionsBtn.expectVisible();
    });
  }

  async verifyWelcomeMessage(userName: string) {
    await this.section(`Verify welcome message for: ${userName}`, async () => {
      await this.welcomeMessage.expectVisible();
      const text = await this.userNameLbl.locator.textContent();
      if (!text?.includes(userName)) {
        throw new Error(`Expected welcome message to contain "${userName}", but found "${text}"`);
      }
    });
  }

  async openGeneralOptions() {
    await this.section('Open general options menu', async () => {
      await this.generalOptionsBtn.click();
      await this.page.waitForTimeout(500); // Wait for menu to expand
    });
  }

  async verifyGeneralOptionsMenu() {
    await this.section('Verify general options menu items', async () => {


      await this.updateProfileLink.expectVisible();
      await this.viewJobsLink.expectVisible();
      await this.screeningQuestionsLink.expectVisible();
      await this.emailSubscriptionsLink.expectVisible();
    });
  }

  async navigateToEmailSubscriptions() {
    await this.section('Navigate to email subscriptions', async () => {
      await this.emailSubscriptionsLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
