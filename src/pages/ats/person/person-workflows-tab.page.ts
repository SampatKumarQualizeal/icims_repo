// src/pages/ats/person/person-workflows-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * PersonWorkflowsTabPage
 * Handles Workflows tab in person profile
 * Shows list of workflow entries for candidate
 * Structure: [data-testid="main-body-iframe"] → iframe
 */
export class PersonWorkflowsTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private workflowsFrame: FrameLocator;
  
  readonly workflowsTab: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const workflowsFrame = mainFrame.locator('iframe').contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Workflows Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.workflowsFrame = workflowsFrame;
    
    // STEP 4: Instantiate components
    this.workflowsTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Workflows' }),
      'Workflows Tab'
    );
  }

  async clickWorkflowsTab() {
    await this.section('Click Workflows tab', async () => {
      await this.workflowsTab.click();
    });
  }

  async clickWorkflowEntry(jobName: string) {
    await this.section(`Click workflow entry for job: ${jobName}`, async () => {
      const workflowLink = new Link(
        this.page,
        this.workflowsFrame.getByRole('link', { name: new RegExp(jobName) }),
        `Workflow Link for ${jobName}`
      );
      await workflowLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
