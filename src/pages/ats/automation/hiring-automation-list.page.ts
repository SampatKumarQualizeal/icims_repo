// src/pages/ats/hiring-automation-list.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';

/**
 * HiringAutomationListPage
 * Lists all hiring automation rules with actions (Edit, Delete, Logs, etc.)
 */
export class HiringAutomationListPage extends BasePage {
  protected mainFrame?: FrameLocator;
  readonly pageHeading: Div;
  readonly addNewBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Hiring Automation List Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.pageHeading = new Div(
      page,
      mainFrame.getByRole('heading', { name: 'Hiring Automation' }),
      'Hiring Automation Heading'
    );
    
    this.addNewBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Add New' }),
      'Add New Button'
    );
  }

  async expectLoaded() {
    await this.section('Hiring Automation List - verify loaded', async () => {
      await this.pageHeading.expectVisible();
      await this.addNewBtn.expectVisible();
    });
  }

  async clickAddNew() {
    await this.section('Click Add New button', async () => {
      await this.addNewBtn.click();
    });
  }

  async findRuleByName(ruleName: string) {
    await this.section(`Find rule: ${ruleName}`, async () => {
      const ruleDiv = new Div(
        this.page,
        this.mainFrame!.getByText(ruleName),
        `Rule: ${ruleName}`
      );
      await ruleDiv.expectVisible();
    });
  }

  async openRuleLogs(ruleName: string) {
    await this.section(`Open logs for rule: ${ruleName}`, async () => {
      const ruleRow = this.mainFrame!.getByText(ruleName).locator('..');
      
      const moreBtn = new Button(
        this.page,
        ruleRow.getByRole('button', { name: 'More' }),
        'More Menu Button'
      );
      await moreBtn.click();
      
      await this.page.waitForLoadState('networkidle');
      
      const logsMenuItem = new Button(
        this.page,
        this.mainFrame!.getByRole('menuitem', { name: 'Logs' }),
        'Logs Menu Item'
      );
      await logsMenuItem.click();
    });
  }

  async verifyRuleInList(ruleName: string) {
    await this.section(`Verify rule in list: ${ruleName}`, async () => {
      const ruleDiv = new Div(
        this.page,
        this.mainFrame!.getByText(ruleName),
        `Rule: ${ruleName}`
      );
      await ruleDiv.expectVisible();
    });
  }
}
