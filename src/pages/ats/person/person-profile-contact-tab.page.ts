// src/pages/ats/person/person-profile-contact-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileContactTabPage
 * Handles Contact tab verification in person profile
 * Verifies: Phone type/number, Address details
 * Structure: [data-testid="main-body-iframe"] → iframe
 */
export class PersonProfileContactTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private contactFrame: FrameLocator;
  
  readonly contactTab: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const contactFrame = mainFrame.locator('iframe').first().contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Contact Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.contactFrame = contactFrame;
    
    // STEP 4: Instantiate components
    this.contactTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Contact' }),
      'Contact Tab'
    );
  }

  async clickContactTab() {
    await this.section('Click Contact tab', async () => {
      await this.contactTab.click();
    });
  }

  async verifyPhoneType(phoneType: string) {
    await this.section(`Verify phone type: ${phoneType}`, async () => {
      const phoneTypeDiv = new Div(
        this.page,
        this.contactFrame.getByText(phoneType),
        'Phone Type'
      );
      await phoneTypeDiv.expectVisible();
    });
  }

  async verifyPhoneNumber(phoneNumber: string) {
    await this.section(`Verify phone number: ${phoneNumber}`, async () => {
      const phoneNumberDiv = new Div(
        this.page,
        this.contactFrame.getByText(phoneNumber),
        'Phone Number'
      );
      await phoneNumberDiv.expectVisible();
    });
  }

  async verifyAddress(address: string) {
    await this.section(`Verify address: ${address}`, async () => {
      const addressDiv = new Div(
        this.page,
        this.contactFrame.getByText(address),
        'Address'
      );
      await addressDiv.expectVisible();
    });
  }

  async verifyCityStateZip(cityStateZip: string) {
    await this.section(`Verify city/state/zip: ${cityStateZip}`, async () => {
      const cityStateZipDiv = new Div(
        this.page,
        this.contactFrame.getByText(cityStateZip),
        'City State Zip'
      );
      await cityStateZipDiv.expectVisible();
    });
  }
}
