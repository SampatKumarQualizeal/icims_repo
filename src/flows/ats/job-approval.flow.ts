// src/flows/ats/job-approval.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { JobSearchPage } from '@src/pages/ats/search/job-search.page';
import { JobProfilePage } from '@src/pages/ats/job/job-profile.page';
import { SearchNavigationService } from '@src/services/search-navigation.service';

/**
 * JobApprovalFlow
 * Orchestrates job approval workflow:
 * - Navigate to job profile
 * - Access and manage approvals
 * - Update approver status
 * - Verify approval completion and status changes
 */
export class JobApprovalFlow extends BaseFlow {
  readonly jobSearchPage: JobSearchPage;
  readonly jobProfilePage: JobProfilePage;
  readonly searchNav: SearchNavigationService;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.jobSearchPage = new JobSearchPage(page);
    this.jobProfilePage = new JobProfilePage(page);
    this.searchNav = new SearchNavigationService(page);
  }

  /**
   * Verify job is in Pending Approval status
   */
  async verifyPendingApprovalStatus() {
    await this.base.logger.section('Verify job is in Pending Approval status', async () => {
      await this.jobProfilePage.verifyPendingApprovalStatus();
    });
  }

  /**
   * Access Approval tab
   */
  async accessApprovalTab() {
    await this.base.logger.section('Access Approval tab', async () => {
      await this.jobProfilePage.clickApprovalTab();
    });
  }

  /**
   * Enter edit mode in Approval tab
   */
  async enterEditMode() {
    await this.base.logger.section('Enter edit mode', async () => {
      await this.jobProfilePage.clickEdit();
    });
  }

  /**
   * Verify approver details
   */
  async verifyApproverDetails(approverName: string, approverEmail: string) {
    await this.base.logger.section('Verify approver details', async () => {
      await this.jobProfilePage.verifyApproverExists(approverName);
      await this.jobProfilePage.verifyApproverEmail(approverEmail);
    });
  }

  /**
   * Verify current approver status
   */
  async verifyCurrentStatus(expectedStatus: string) {
    await this.base.logger.section(`Verify current status: ${expectedStatus}`, async () => {
      const actualStatus = await this.jobProfilePage.getCurrentApproverStatus();
      this.base.assertThat(actualStatus).equals(expectedStatus);
    });
  }

  /**
   * Update approver status
   */
  async updateApproverStatus(status: string) {
    await this.base.logger.section(`Update approver status to: ${status}`, async () => {
      await this.jobProfilePage.updateApproverStatus(status);
      
      // Verify status was updated
      const updatedStatus = await this.jobProfilePage.getCurrentApproverStatus();
      this.base.assertThat(updatedStatus).equals(status);
    });
  }

  /**
   * Save approval changes
   */
  async saveApprovalChanges() {
    await this.base.logger.section('Save approval changes', async () => {
      await this.jobProfilePage.clickSave();
    });
  }

  /**
   * Verify approval completion
   */
  async verifyApprovalCompletion() {
    await this.base.logger.section('Verify approval completion', async () => {
      await this.jobProfilePage.verifyCompletionMessage();
      await this.jobProfilePage.verifyEditButtonVisible();
    });
  }

  /**
   * Verify approver status in read-only view
   */
  async verifyApproverStatusReadOnly(status: string) {
    await this.base.logger.section(`Verify approver status in read-only: ${status}`, async () => {
      await this.jobProfilePage.verifyApproverStatusInReadOnly(status);
    });
  }

  /**
   * Navigate to People tab and verify status changes
   */
  async verifyStatusChangesOnPeopleTab(expectedStatus: string) {
    await this.base.logger.section('Verify status changes on People tab', async () => {
      await this.jobProfilePage.clickPeopleTab();
      await this.jobProfilePage.verifyFolderStatus(expectedStatus);
      await this.jobProfilePage.verifyDaysApprovedMetric();
      await this.jobProfilePage.verifyJobApprovalActivity();
      await this.jobProfilePage.verifyEmailSentActivity();
      await this.jobProfilePage.verifyApprovalDate();
    });
  }

  /**
   * Verify progress indicator completion
   */
  async verifyProgressIndicator() {
    await this.base.logger.section('Verify progress indicator', async () => {
      await this.jobProfilePage.verifyProgressIndicator();
    });
  }

  /**
   * Navigate to Overview tab and verify approval widget
   */
  async verifyApprovalOnOverviewTab() {
    await this.base.logger.section('Verify approval on Overview tab', async () => {
      await this.jobProfilePage.clickOverviewTab();
      // The approval widget verification would be similar to activity feed
      // For now, we verify the approval date
      await this.jobProfilePage.verifyApprovalDate();
    });
  }
}
