// src/pages/ats/person-profile.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfilePage
 * Represents a candidate/person profile page
 * Used to verify workflow status from the person's perspective
 */
export class PersonProfilePage extends BasePage {
  readonly workflowsTab: Button;
  readonly backButton: Button;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframe
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const personFrame = mainFrame.locator('iframe').last().contentFrame();
    
    // STEP 2: Call super
    super(page, personFrame.locator('body'), 'Person Profile Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = personFrame;
    
    // STEP 4: Instantiate components
    this.workflowsTab = new Button(
      page,
      personFrame.getByRole('tab', { name: /Workflows/i }),
      'Workflows Tab'
    );
    
    this.backButton = new Button(
      page,
      personFrame.getByRole('button', { name: /Back/i }),
      'Back Button'
    );
  }

  async expectLoaded() {
    await this.section('Person Profile - verify loaded', async () => {
      await this.workflowsTab.expectVisible();
    });
  }

  async goToWorkflowsTab() {
    await this.section('Navigate to Workflows tab', async () => {
      await this.workflowsTab.click();
    });
  }

  async verifyStatusInWorkflows(statusName: string) {
    await this.section(`Verify status in workflows: ${statusName}`, async () => {
      // TODO: Replace with specific selector for status in workflows table
      const statusText = new Div(
        this.page,
        this.page.locator(`text=${statusName}`).first(),
        `Status Text: ${statusName}`
      );
      await statusText.expectVisible();
    });
  }

  async clickBack() {
    await this.section('Click Back button', async () => {
      await this.backButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
