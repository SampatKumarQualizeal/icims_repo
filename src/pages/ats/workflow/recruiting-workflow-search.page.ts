// src/pages/ats/recruiting-workflow-search.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Checkbox } from '@src/components/checkbox.component';

/**
 * RecruitingWorkflowSearchPage
 * Handles searching and navigating to recruiting workflow profiles
 * Includes toolbar actions: Submit to Workflow, Email, Share, iForms, More menu
 */
export class RecruitingWorkflowSearchPage extends BasePage {
  readonly searchButton: Button;
  readonly groupExpander: Button;
  readonly firstWorkflowLink: Link;

  // Toolbar action buttons
  readonly submitToWorkflowBtn: Button;
  readonly emailBtn: Button;
  readonly shareBtn: Button;
  readonly iFormsBtn: Button;
  readonly moreBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');

    // STEP 2: Call super with iframe root
    super(page, mainFrame.locator('body'), 'Recruiting Workflow Search');

    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;

    // STEP 4: Instantiate components
    this.searchButton = new Button(
      page,
      mainFrame.getByRole('button', { name: ' Search' }),
      'Search Button'
    );

    this.groupExpander = new Button(
      page,
      mainFrame.locator('#groupExpander3_0').first(),
      'Status Group Expander'
    );

    // TODO: Replace with specific selector for workflow link when pattern is known
    this.firstWorkflowLink = new Link(
      page,
      mainFrame.getByRole('link').first(),
      'First Workflow Link'
    );

    // Toolbar action buttons (in iframe)
    this.submitToWorkflowBtn = new Button(
      page,
      mainFrame.locator("(//span[contains(text(),'Submit to Workflow')]/ancestor::a)[1]"),
      'Submit to Workflow Button'
    );

    this.emailBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: ' Email' }),
      'Email Button'
    );

    this.shareBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: ' Share' }),
      'Share Button'
    );

    this.iFormsBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: ' iForms' }),
      'iForms Button'
    );

    this.moreBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'More', exact: true }),
      'More Button'
    );
  }

  async expectLoaded() {
    await this.section('Search Page - verify loaded', async () => {
      await this.searchButton.expectVisible();
    });
  }

  async navigateToSearch() {
    await this.section('Navigate to Recruiting Workflow search', async () => {
      const navMenuBtn = new Button(
        this.page,
        this.page.getByRole('button', { name: 'Navigator Menu' }),
        'Navigator Menu'
      );

      const searchBtn = new Button(
        this.page,
        this.page.getByRole('button', { name: /Search/ }),
        'Search Button'
      );

      const workflowLink = new Link(
        this.page,
        this.page.getByRole('link', { name: 'Recruiting Workflow' }),
        'Recruiting Workflow Link'
      );

      await navMenuBtn.click();
      await searchBtn.click();
      await workflowLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async runSearch() {
    await this.section('Run search', async () => {
      await this.searchButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expandStatusGroup() {
    await this.section('Expand status group', async () => {
      const isVisible = await this.groupExpander.isVisible().catch(() => false);
      if (isVisible) {
        await this.groupExpander.click();
      }
    });
  }

  async openFirstWorkflow() {
    await this.section('Open first workflow', async () => {
      await this.firstWorkflowLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expandGroup(groupName: string, subGroupName: string) {
    await this.section(`Expand group: ${groupName}`, async () => {
      const iframe = this.page.frameLocator('[data-testid="main-body-iframe"]');

      // Wait until the group row is visible
      await this.frameLocator!
        .locator('#searchResultsGridTable')
        .locator(`tr:has-text("${groupName}")`)
        .waitFor({ state: 'visible', timeout: 10000 });

      // Group chevron
      const chevronGroup = iframe.locator(
        `(//td[.//span[contains(text(),"${groupName}")]]/preceding-sibling::td[2]//div)[1]`
      );
      const isGroupExpanded = (await chevronGroup.getAttribute('title')) === 'Collapse';

      if (isGroupExpanded) {
        const chevronSubGroup = iframe.locator(
          `(//td[.//span[contains(text(),"${subGroupName}")]]/preceding-sibling::td[2]//div)[1]`
        );
        const isSubGroupExpanded = (await chevronSubGroup.getAttribute('title')) === 'Collapse';

        if (!isSubGroupExpanded) {
          await chevronSubGroup.click();
        } else {
          throw new Error(
            `Expand button for subgroup '${subGroupName}' in group '${groupName}' not found.`
          );
        }
      }
    });
  }

  async selectCandidateRow(candidateName: string) {
    await this.section(`Select candidate row: ${candidateName}`, async () => {
      const candidateRow = new Button(
        this.page,
        this.frameLocator!.getByRole('row', { name: new RegExp(`Select Row.*${candidateName}`, 'i') }),
        `Candidate Row: ${candidateName}`
      );

      const rowCheckbox = new Checkbox(
        this.page,
        candidateRow.locator.getByLabel('Select Row'),
        'Row Selection Checkbox'
      );

      await rowCheckbox.check();
    });
  }

  async clickMoreButton() {
    await this.section('Click More button', async () => {
      const iframe = this.page.frameLocator('[data-testid="main-body-iframe"]');
      await iframe.getByRole('button', { name: 'More ' }).click();
    });
  }

  getSubmitToWorkflowButton() {
    const iframe = this.page.frameLocator('[data-testid="main-body-iframe"]');
    return new Button(
      this.page,
      iframe.getByRole('button', { name: ' Submit to Workflow' }),
      'Submit to Workflow Button'
    );
  }

  async clickEmail() {
    await this.section('Click Email button', async () => {
      await this.emailBtn.click();
    });
  }

  async clickShare() {
    await this.section('Click Share button', async () => {
      await this.shareBtn.click();
    });
  }

  async clickIForms() {
    await this.section('Click iForms button', async () => {
      await this.iFormsBtn.click();
    });
  }

  async clickMore() {
    await this.section('Click More menu', async () => {
      await this.moreBtn.click();
    });
  }

  async clickMoreMenuItem(menuItemName: string) {
    await this.section(`Click More menu item: ${menuItemName}`, async () => {

      await this.clickMoreButton();

      const menuItem = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: menuItemName }),
        `Menu Item: ${menuItemName}`
      );

      await menuItem.click();
    });
  }

  async verifyToolbarEnabled() {
    await this.section('Verify toolbar buttons enabled', async () => {
      await this.emailBtn.expectVisible();
      await this.shareBtn.expectVisible();
      await this.iFormsBtn.expectVisible();
    });
  }
}
