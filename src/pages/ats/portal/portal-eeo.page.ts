// src/pages/ats/portal/portal-eeo.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';

/**
 * PortalEEOPage
 * Step 3 of 3: EEO Information page
 * Includes: Gender, Race selection
 * Renders inside: iframe[name="icims_content_iframe"]
 */
export class PortalEEOPage extends BasePage {
  private contentFrame: FrameLocator;
  
  readonly genderDropdown: Dropdown;
  readonly raceDropdown: Dropdown;
  readonly submitBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Portal EEO Page');
    
    // STEP 3: Store frameLocator
    this.contentFrame = contentFrame;
    
    // STEP 4: Instantiate components
    this.genderDropdown = new Dropdown(
      page,
      contentFrame.locator('select[name="rc806"]'),
      'Gender Dropdown'
    );
    
    this.raceDropdown = new Dropdown(
      page,
      contentFrame.locator('select[name="rc807"]'),
      'Race Dropdown'
    );
    
    this.submitBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Submit' }),
      'Submit Button'
    );
  }

  async fillEEO(gender: string, race: string) {
    await this.section('Fill EEO Information', async () => {
      await this.genderDropdown.select(gender);
      await this.raceDropdown.select(race);
    });
  }

  async submit() {
    await this.section('Submit EEO data', async () => {
      await this.submitBtn.click();
    });
  }
}
