// src/pages/ats/person/person-submit-to-requisition.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';

/**
 * PersonSubmitToRequisitionPage
 * Handles submitting candidate to job/requisition
 * Button appears in person profile
 * Renders inside: [data-testid="main-body-iframe"]
 */
export class PersonSubmitToRequisitionPage extends BasePage {
  private mainFrame: FrameLocator;
  
  readonly submitToRequisitionBtn: Button;
  readonly submitBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Submit to Requisition Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.submitToRequisitionBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Submit to Requisition' }),
      'Submit to Requisition Button'
    );
    
    this.submitBtn = new Button(
      page,
      page.getByRole('button', { name: 'Submit' }),
      'Submit Button'
    );
  }

  async clickSubmitToRequisition() {
    await this.section('Click Submit to Requisition', async () => {
      await this.submitToRequisitionBtn.click();
    });
  }

  async selectJob(jobName: string) {
    await this.section(`Select job: ${jobName}`, async () => {
      const jobOption = this.page.getByRole('option', { name: new RegExp(jobName) });
      await jobOption.click();
    });
  }

  async clickSubmit() {
    await this.section('Click Submit button', async () => {
      await this.submitBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
