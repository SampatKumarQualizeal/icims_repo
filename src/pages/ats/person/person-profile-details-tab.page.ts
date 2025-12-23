// src/pages/ats/person/person-profile-details-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileDetailsTabPage
 * Handles Cand. Details tab verification in person profile
 * Verifies: Source Channel, Source, Source Device, Source Portal
 * Structure: [data-testid="main-body-iframe"] → iframe
 */
export class PersonProfileDetailsTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private detailsFrame: FrameLocator;
  
  readonly candDetailsTab: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const detailsFrame = mainFrame.locator('iframe').first().contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Details Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.detailsFrame = detailsFrame;
    
    // STEP 4: Instantiate components
    this.candDetailsTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Cand. Details' }),
      'Cand. Details Tab'
    );
  }

  async clickCandDetailsTab() {
    await this.section('Click Cand. Details tab', async () => {
      await this.candDetailsTab.click();
    });
  }

  async verifySourceChannel(sourceChannel: string) {
    await this.section(`Verify Source Channel: ${sourceChannel}`, async () => {
      const sourceChannelLabel = new Div(
        this.page,
        this.detailsFrame.getByText('Source Channel'),
        'Source Channel Label'
      );
      await sourceChannelLabel.expectVisible();
      
      const sourceChannelValue = new Div(
        this.page,
        this.detailsFrame.getByText(sourceChannel),
        'Source Channel Value'
      );
      await sourceChannelValue.expectVisible();
    });
  }

  async verifySource(source: string) {
    await this.section(`Verify Source: ${source}`, async () => {
      const sourceLabel = new Div(
        this.page,
        this.detailsFrame.getByText('Source', { exact: true }),
        'Source Label'
      );
      await sourceLabel.expectVisible();
      
      const sourceValue = new Div(
        this.page,
        this.detailsFrame.getByText(source),
        'Source Value'
      );
      await sourceValue.expectVisible();
    });
  }

  async verifySourceDevice(sourceDevice: string) {
    await this.section(`Verify Source Device: ${sourceDevice}`, async () => {
      const sourceDeviceLabel = new Div(
        this.page,
        this.detailsFrame.getByText('Source Device'),
        'Source Device Label'
      );
      await sourceDeviceLabel.expectVisible();
      
      const sourceDeviceValue = new Div(
        this.page,
        this.detailsFrame.getByText(sourceDevice),
        'Source Device Value'
      );
      await sourceDeviceValue.expectVisible();
    });
  }

  async verifySourcePortal(sourcePortal: string) {
    await this.section(`Verify Source Portal: ${sourcePortal}`, async () => {
      const sourcePortalLabel = new Div(
        this.page,
        this.detailsFrame.getByText('Source Portal'),
        'Source Portal Label'
      );
      await sourcePortalLabel.expectVisible();
      
      const sourcePortalValue = new Div(
        this.page,
        this.detailsFrame.getByText(sourcePortal),
        'Source Portal Value'
      );
      await sourcePortalValue.expectVisible();
    });
  }
}
