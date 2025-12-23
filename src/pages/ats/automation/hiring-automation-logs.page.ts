// src/pages/ats/hiring-automation-logs.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Div } from '@src/components/div.component';

/**
 * HiringAutomationLogsPage
 * View execution logs for automation rules
 */
export class HiringAutomationLogsPage extends BasePage {
  protected mainFrame?: FrameLocator;
  readonly pageHeading: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Hiring Automation Logs Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.pageHeading = new Div(
      page,
      mainFrame.getByRole('heading', { name: 'Automation Logs' }),
      'Automation Logs Heading'
    );
  }

  async expectLoaded() {
    await this.section('Hiring Automation Logs - verify loaded', async () => {
      await this.pageHeading.expectVisible();
    });
  }

  async verifyRecentLogEntry(automationName: string) {
    await this.section('Verify recent log entry', async () => {
      const recentLogEntry = new Div(
        this.page,
        this.mainFrame!.locator('table tbody tr').first(),
        'Recent Log Entry'
      );
      await recentLogEntry.expectVisible();
      
      // Verify log contains automation name
      const logText = await recentLogEntry.getText();
      if (!logText.includes(automationName)) {
        throw new Error(`Log entry does not contain automation name: ${automationName}`);
      }
    });
  }

  async verifyLogSuccess() {
    await this.section('Verify log shows success', async () => {
      const recentLogEntry = this.mainFrame!.locator('table tbody tr').first();
      const successDiv = new Div(
        this.page,
        recentLogEntry.getByText(/Success|Completed|Sent/i),
        'Success Indicator'
      );
      await successDiv.expectVisible();
    });
  }

  async verifyActionInfo(expectedText: string) {
    await this.section(`Verify action info contains: ${expectedText}`, async () => {
      const recentLogEntry = this.mainFrame!.locator('table tbody tr').first();
      const actionInfoDiv = new Div(
        this.page,
        recentLogEntry.getByText(new RegExp(expectedText, 'i')),
        'Action Info'
      );
      await actionInfoDiv.expectVisible();
    });
  }
}
