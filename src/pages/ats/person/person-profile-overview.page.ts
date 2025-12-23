// src/pages/ats/person/person-profile-overview.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';

/**
 * PersonProfileOverviewPage
 * Handles person profile header and overview verification
 * Verifies: Name heading, Email, Phone, Address, Activity log
 * Structure: [data-testid="main-body-iframe"]
 */
export class PersonProfileOverviewPage extends BasePage {
  private mainFrame: FrameLocator;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Overview');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: No static components - all dynamic verification
  }

  async verifyName(firstName: string, lastName: string) {
    await this.section(`Verify name: ${firstName} ${lastName}`, async () => {
      const nameHeading = new Div(
        this.page,
        this.mainFrame.getByRole('heading', { name: `${firstName} ${lastName}` }),
        'Name Heading'
      );
      await nameHeading.expectVisible();
    });
  }

  async verifyEmail(email: string) {
    await this.section(`Verify email: ${email}`, async () => {
      const emailLink = new Link(
        this.page,
        this.mainFrame.getByRole('link', { name: email }),
        'Email Link'
      );
      await emailLink.expectVisible();
    });
  }

  async verifyPhone(phone: string) {
    await this.section(`Verify phone: ${phone}`, async () => {
      const phoneDiv = new Div(
        this.page,
        this.mainFrame.getByText(phone),
        'Phone Number'
      );
      await phoneDiv.expectVisible();
    });
  }

  async verifyCity(city: string) {
    await this.section(`Verify city: ${city}`, async () => {
      const cityDiv = new Div(
        this.page,
        this.mainFrame.getByText(new RegExp(city)),
        'City'
      );
      await cityDiv.expectVisible();
    });
  }

  async verifyActivityLog(activityText: string) {
    await this.section(`Verify activity log: ${activityText}`, async () => {
      const activityDiv = new Div(
        this.page,
        this.mainFrame.getByText(activityText),
        'Activity Log Entry'
      );
      await activityDiv.expectVisible();
    });
  }
}
