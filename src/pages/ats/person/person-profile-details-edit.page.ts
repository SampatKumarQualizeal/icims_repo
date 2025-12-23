// src/pages/ats/person/person-profile-details-edit.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileDetailsEditPage
 * Handles editing Cand. Details tab in person profile
 * Includes: Certifications/Licenses
 * Structure: [data-testid="main-body-iframe"] → iframe[name="target_frame_left"]
 * 
 * Note: Certification editing UI appears conditionally if certifications exist
 */
export class PersonProfileDetailsEditPage extends BasePage {
  private mainFrame: FrameLocator;
  private detailsFrame: FrameLocator;
  
  readonly candDetailsTab: Button;
  readonly editBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const detailsFrame = mainFrame.locator('iframe[name="target_frame_left"]').contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Details Edit');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.detailsFrame = detailsFrame;
    
    // STEP 4: Instantiate components
    this.candDetailsTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Cand. Details' }),
      'Cand. Details Tab'
    );
    
    this.editBtn = new Button(
      page,
      detailsFrame.getByRole('button', { name: 'Edit', exact: true }),
      'Edit Button'
    );
    
    this.cancelBtn = new Button(
      page,
      detailsFrame.getByRole('button', { name: 'Cancel', exact: true }),
      'Cancel Button'
    );
  }

  async clickCandDetailsTab() {
    await this.section('Click Cand. Details tab', async () => {
      await this.candDetailsTab.click();
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
    });
  }

  async clickCancel() {
    await this.section('Click Cancel button', async () => {
      await this.cancelBtn.click();
    });
  }

  async hasCertifications(): Promise<boolean> {
    let result = false;
    await this.section('Check if certifications exist', async () => {
      const certificationDiv = new Div(
        this.page,
        this.detailsFrame.locator('text="License/Certification"'),
        'License/Certification Section'
      );
      
      try {
        await certificationDiv.expectVisible();
        result = true;
      } catch {
        result = false;
      }
    });
    return result;
  }
}
