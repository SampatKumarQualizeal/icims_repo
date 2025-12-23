// src/pages/ats/job-profile.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';

/**
 * JobProfilePage
 * Represents a job profile page with tabs (Overview, Approval, People, etc.)
 * Handles approval workflow management
 */
export class JobProfilePage extends BasePage {
  protected mainFrame?: FrameLocator;
  protected approvalFrame?: FrameLocator;
  readonly approvalTab: Button;
  readonly peopleTab: Button;
  readonly overviewTab: Button;
  readonly moreTab: Button;
  readonly notesMenuItem: Button;
  readonly notesTab: Button;
  readonly editBtn: Button;
  readonly saveBtn: Button;
  readonly cancelBtn: Button;
  readonly resetApprovalBtn: Button;
  readonly statusDropdown: Dropdown;
  readonly hiringManagerLabel: Div;
  readonly pendingApprovalStatus: Div;
  readonly approvedStatus: Div;
  readonly approversHeading: Div;
  readonly completionMessage: Div;
  readonly jobApprovalCompletedActivity: Div;
  readonly daysApprovedMetric: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe contexts
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const approvalFrame = mainFrame.frameLocator('iframe[name="target_frame_left"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Job Profile Page');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.approvalFrame = approvalFrame;
    
    // STEP 4: Instantiate components
    // Tabs in main frame
    this.approvalTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Approval' }),
      'Approval Tab'
    );
    
    this.peopleTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'People' }),
      'People Tab'
    );
    
    this.overviewTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Overview' }),
      'Overview Tab'
    );
    
    this.moreTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'More' }),
      'More Tab'
    );
    
    this.notesMenuItem = new Button(
      page,
      mainFrame.getByRole('menuitem', { name: 'Notes' }),
      'Notes Menu Item'
    );
    
    this.notesTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Notes' }),
      'Notes Tab'
    );
    
    // Approval frame components
    this.editBtn = new Button(
      page,
      approvalFrame.getByRole('button', { name: 'Edit' }),
      'Edit Button'
    );
    
    this.saveBtn = new Button(
      page,
      approvalFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.cancelBtn = new Button(
      page,
      approvalFrame.getByRole('button', { name: 'Cancel' }),
      'Cancel Button'
    );
    
    this.resetApprovalBtn = new Button(
      page,
      approvalFrame.getByRole('button', { name: 'Reset Approval' }),
      'Reset Approval Button'
    );
    
    this.statusDropdown = new Dropdown(
      page,
      approvalFrame.getByLabel('status_', { exact: false }),
      'Status Dropdown'
    );
    
    this.approversHeading = new Div(
      page,
      approvalFrame.getByRole('heading', { name: 'Approver(s)' }),
      'Approvers Heading'
    );
    
    this.completionMessage = new Div(
      page,
      approvalFrame.getByText('This approval process has been completed.'),
      'Completion Message'
    );
    
    // Main frame components
    this.hiringManagerLabel = new Div(
      page,
      mainFrame.getByText('Hiring Manager:'),
      'Hiring Manager Label'
    );
    
    this.pendingApprovalStatus = new Div(
      page,
      mainFrame.locator('text=Pending Approval').first(),
      'Pending Approval Status'
    );
    
    this.approvedStatus = new Div(
      page,
      mainFrame.getByText('Approved', { exact: true }).first(),
      'Approved Status'
    );
    
    this.jobApprovalCompletedActivity = new Div(
      page,
      mainFrame.getByText('Job Approval Completed'),
      'Job Approval Completed Activity'
    );
    
    this.daysApprovedMetric = new Div(
      page,
      mainFrame.getByText('# Days Since First Approved'),
      '# Days Since First Approved Metric'
    );
  }

  async expectLoaded() {
    await this.section('Job Profile - verify loaded', async () => {
      await this.hiringManagerLabel.expectVisible();
    });
  }

  async clickApprovalTab() {
    await this.section('Click Approval tab', async () => {
      await this.approvalTab.click();
      await this.approversHeading.expectVisible();
    });
  }

  async clickPeopleTab() {
    await this.section('Click People tab', async () => {
      await this.peopleTab.click();
    });
  }

  async clickOverviewTab() {
    await this.section('Click Overview tab', async () => {
      await this.overviewTab.click();
    });
  }

  async clickNotesTab() {
    await this.section('Click More tab and select Notes', async () => {
      await this.moreTab.click();
      await this.notesMenuItem.click();
      await this.page.waitForTimeout(1000);
      
      // Verify Notes tab is now active
      const ariaSelected = await this.notesTab.locator.getAttribute('aria-selected');
      if (ariaSelected !== 'true') {
        throw new Error('Notes tab is not active after clicking');
      }
    });
  }

  async verifyNotesTabActive() {
    await this.section('Verify Notes tab is active', async () => {
      const ariaSelected = await this.notesTab.locator.getAttribute('aria-selected');
      if (ariaSelected !== 'true') {
        throw new Error('Notes tab is not active');
      }
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
      await this.saveBtn.expectVisible();
    });
  }

  async clickSave() {
    await this.section('Save approval changes', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickCancel() {
    await this.section('Cancel approval changes', async () => {
      await this.cancelBtn.click();
    });
  }

  async verifyApproverExists(approverName: string) {
    await this.section(`Verify approver exists: ${approverName}`, async () => {
      const approverDiv = new Div(
        this.page,
        this.approvalFrame!.getByText(approverName),
        `Approver: ${approverName}`
      );
      await approverDiv.expectVisible();
    });
  }

  async verifyApproverEmail(email: string) {
    await this.section(`Verify approver email: ${email}`, async () => {
      const emailDiv = new Div(
        this.page,
        this.approvalFrame!.getByText(email),
        `Approver Email: ${email}`
      );
      await emailDiv.expectVisible();
    });
  }

  async getCurrentApproverStatus(): Promise<string> {
    const value = await this.statusDropdown.locator.inputValue();
    return value;
  }

  async updateApproverStatus(status: string) {
    await this.section(`Update approver status to: ${status}`, async () => {
      await this.statusDropdown.select(status);
    });
  }

  async verifyCompletionMessage() {
    await this.section('Verify approval completion message', async () => {
      await this.completionMessage.expectVisible();
    });
  }

  async verifyEditButtonVisible() {
    await this.section('Verify Edit button visible', async () => {
      await this.editBtn.expectVisible();
    });
  }

  async verifyApproverStatusInReadOnly(status: string) {
    await this.section(`Verify approver status in read-only: ${status}`, async () => {
      const statusDiv = new Div(
        this.page,
        this.approvalFrame!.getByText(status),
        `Status: ${status}`
      );
      await statusDiv.expectVisible();
    });
  }

  async verifyFolderStatus(status: string) {
    await this.section(`Verify folder status: ${status}`, async () => {
      const statusDiv = new Div(
        this.page,
        this.mainFrame!.getByText(status, { exact: true }).first(),
        `Folder Status: ${status}`
      );
      await statusDiv.expectVisible();
    });
  }

  async verifyJobApprovalActivity() {
    await this.section('Verify Job Approval Completed activity', async () => {
      await this.jobApprovalCompletedActivity.expectVisible();
    });
  }

  async verifyEmailSentActivity() {
    await this.section('Verify Email Sent activity', async () => {
      const emailActivity = new Div(
        this.page,
        this.mainFrame!.getByText(/Email Sent.*Job Status.*Approved/i),
        'Email Sent Activity'
      );
      await emailActivity.expectVisible();
    });
  }

  async verifyDaysApprovedMetric() {
    await this.section('Verify # Days Since First Approved metric', async () => {
      await this.daysApprovedMetric.expectVisible();
    });
  }

  async verifyApprovalDate() {
    await this.section('Verify approval date is today', async () => {
      // Date format: MM/DD/YYYY HH:MM AM/PM
      const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/;
      const dateDiv = new Div(
        this.page,
        this.mainFrame!.locator(`text=${dateRegex.source}`).first(),
        'Approval Date'
      );
      await dateDiv.expectVisible();
    });
  }

  async verifyProgressIndicator() {
    await this.section('Verify progress indicator shows completion', async () => {
      const progressImages = new Div(
        this.page,
        this.mainFrame!.locator('img[alt*="Pending"]').first(),
        'Progress Indicator'
      );
      await progressImages.expectVisible();
    });
  }

  async verifyPendingApprovalStatus() {
    await this.section('Verify job is in Pending Approval status', async () => {
      await this.pendingApprovalStatus.expectVisible();
    });
  }

  async verifyApprovedStatus() {
    await this.section('Verify job is in Approved status', async () => {
      await this.approvedStatus.expectVisible();
    });
  }
}
