// src/pages/ats/recruiting-workflow-profile.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * RecruitingWorkflowProfilePage
 * Represents a recruiting workflow profile with Advance/Reject actions
 * Note: This page is in a nested iframe structure
 */
export class RecruitingWorkflowProfilePage extends BasePage {
  readonly advanceBtn: Button;
  readonly rejectBtn: Button;
  readonly activityTab: Button;
  readonly showMoreBtn: Button;
  readonly candidateLink: Link;
  readonly backButton: Button;
  readonly cancelButton: Button;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframe (main-body > profile iframe)
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const profileFrame = mainFrame.locator('iframe').last().contentFrame();
    
    // STEP 2: Call super with profile frame root
    super(page, profileFrame.locator('body'), 'Recruiting Workflow Profile');
    
    // STEP 3: Store frameLocator
    this.frameLocator = profileFrame;
    
    // STEP 4: Instantiate components
    this.advanceBtn = new Button(
      page,
      profileFrame.getByRole('button', { name: /Advance/i }),
      'Advance Button'
    );
    
    this.rejectBtn = new Button(
      page,
      profileFrame.getByRole('button', { name: /Reject/i }),
      'Reject Button'
    );
    
    this.activityTab = new Button(
      page,
      profileFrame.getByRole('tab', { name: /Activity/i }),
      'Activity Tab'
    );
    
    this.showMoreBtn = new Button(
      page,
      profileFrame.getByRole('button', { name: /Show more/i }),
      'Show More Statuses'
    );
    
    // TODO: Verify actual selector for candidate profile link in profile card
    this.candidateLink = new Link(
      page,
      profileFrame.locator('.profile-card a').first(),
      'Candidate Profile Link'
    );
    
    this.backButton = new Button(
      page,
      profileFrame.getByRole('button', { name: /Back/i }),
      'Back Button'
    );
    
    this.cancelButton = new Button(
      page,
      profileFrame.getByRole('button', { name: /Cancel/i }),
      'Cancel Button'
    );
  }

  async expectLoaded() {
    await this.section('Workflow Profile - verify loaded', async () => {
      await this.advanceBtn.expectVisible();
      await this.rejectBtn.expectVisible();
    });
  }

  async selectAdvanceStatus(statusName: string) {
    await this.section(`Select advance status: ${statusName}`, async () => {
      await this.advanceBtn.click();
      
      const isShowMoreVisible = await this.showMoreBtn.isVisible().catch(() => false);
      if (isShowMoreVisible) {
        await this.showMoreBtn.click();
      }
      
      // TODO: Verify actual selector pattern for status options
      const statusBtn = new Button(
        this.page,
        this.page.locator(`text=${statusName}`).first(),
        `Status: ${statusName}`
      );
      
      await statusBtn.click();
    });
  }

  async selectRejectStatus(statusName: string) {
    await this.section(`Select reject status: ${statusName}`, async () => {
      await this.rejectBtn.click();
      
      const isShowMoreVisible = await this.showMoreBtn.isVisible().catch(() => false);
      if (isShowMoreVisible) {
        await this.showMoreBtn.click();
      }
      
      // TODO: Verify selector for reject status options
      const statusBtn = new Button(
        this.page,
        this.page.locator(`text=${statusName}`).first(),
        `Reject Status: ${statusName}`
      );
      
      await statusBtn.click();
    });
  }

  async clickActivityTab() {
    await this.section('Navigate to Activity tab', async () => {
      await this.activityTab.click();
    });
  }

  async verifyActivityEntry(text: string) {
    await this.section(`Verify activity entry: ${text}`, async () => {
      // TODO: Replace with specific activity entry selector
      const activityEntry = new Div(
        this.page,
        this.page.locator(`text=${text}`).first(),
        `Activity Entry: ${text}`
      );
      await activityEntry.expectVisible();
    });
  }

  async clickCandidateLink() {
    await this.section('Navigate to candidate profile', async () => {
      await this.candidateLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickCancel() {
    await this.section('Click Cancel button', async () => {
      await this.cancelButton.click();
    });
  }
}
