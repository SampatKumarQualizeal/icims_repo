// src/pages/ats/workflow/workflow-profile.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * WorkflowProfilePage
 * Handles workflow profile actions (Advance, Reject)
 * Accessed via Workflows tab in person profile
 * Structure: Main page (not in iframe for Advance/Reject buttons)
 */
export class WorkflowProfilePage extends BasePage {
  readonly advanceBtn: Button;
  readonly rejectBtn: Button;
  readonly okBtn: Button;

  constructor(page: Page) {
    // STEP 1: No iframe - main page level
    
    // STEP 2: Call super
    super(page, page.locator('body'), 'Workflow Profile Page');
    
    // STEP 3: No frameLocator
    
    // STEP 4: Instantiate components
    this.advanceBtn = new Button(
      page,
      page.getByRole('button', { name: 'Advance' }),
      'Advance Button'
    );
    
    this.rejectBtn = new Button(
      page,
      page.getByRole('button', { name: 'Reject' }),
      'Reject Button'
    );
    
    this.okBtn = new Button(
      page,
      page.getByRole('button', { name: 'OK' }),
      'OK Button'
    );
  }

  async clickAdvance() {
    await this.section('Click Advance button', async () => {
      await this.advanceBtn.click();
    });
  }

  async selectStatus(statusName: string) {
    await this.section(`Select status: ${statusName}`, async () => {
      const statusOption = this.page.getByRole('option', { name: new RegExp(statusName) });
      await statusOption.click();
    });
  }

  async clickOk() {
    await this.section('Click OK button', async () => {
      await this.okBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyBinStatus(binName: string, statusName: string) {
    await this.section(`Verify Bin: ${binName}, Status: ${statusName}`, async () => {
      const binText = new Div(
        this.page,
        this.page.getByText(new RegExp(`Bin:.*${binName}`)),
        'Bin Text'
      );
      await binText.expectVisible();
      
      const statusText = new Div(
        this.page,
        this.page.getByText(new RegExp(`Status:.*${statusName}`)),
        'Status Text'
      );
      await statusText.expectVisible();
    });
  }
}
