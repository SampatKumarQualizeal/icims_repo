// src/flows/ats/recruiting-workflow.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { RecruitingWorkflowSearchPage } from '@src/pages/ats/workflow/recruiting-workflow-search.page';
import { RecruitingWorkflowProfilePage } from '@src/pages/ats/workflow/recruiting-workflow-profile.page';
import { PersonProfilePage } from '@src/pages/ats/person/person-profile.page';
import { OnboardingWizardModal } from '@src/pages/ats/onboarding-wizard.modal';

export interface OnboardingConfig {
  jobFolder?: string;
  candidateFolder?: boolean;
  createEmployee?: boolean;
  category?: string;
  email: {
    subject: string;
    body: string;
  };
}

/**
 * RecruitingWorkflowFlow
 * Orchestrates recruiting workflow status changes, including:
 * - Advancing/Rejecting workflows
 * - Verifying status changes on candidate profiles
 * - Handling External Portal auto-launch wizard
 */
export class RecruitingWorkflowFlow extends BaseFlow {
  readonly searchPage: RecruitingWorkflowSearchPage;
  readonly profilePage: RecruitingWorkflowProfilePage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.searchPage = new RecruitingWorkflowSearchPage(page);
    this.profilePage = new RecruitingWorkflowProfilePage(page);
  }

  async navigateAndOpenWorkflow() {
    await this.base.logger.section('Navigate to workflow search and open first workflow', async () => {
      await this.searchPage.navigateToSearch();
      await this.searchPage.runSearch();
      await this.searchPage.expandStatusGroup();
      await this.searchPage.openFirstWorkflow();
      await this.profilePage.expectLoaded();
    });
  }

  async advanceWorkflowStatus(statusName: string) {
    await this.base.logger.section(`Advance workflow to: ${statusName}`, async () => {
      await this.profilePage.selectAdvanceStatus(statusName);
      await this.profilePage.clickActivityTab();
      await this.profilePage.verifyActivityEntry(statusName);
    });
  }

  async rejectWorkflowStatus(statusName: string) {
    await this.base.logger.section(`Reject workflow to: ${statusName}`, async () => {
      await this.profilePage.selectRejectStatus(statusName);
      await this.profilePage.clickActivityTab();
      await this.profilePage.verifyActivityEntry(statusName);
    });
  }

  async verifyCandidateWorkflowStatus(statusName: string) {
    await this.base.logger.section('Verify status on candidate profile', async () => {
      await this.profilePage.clickCandidateLink();
      
      const personPage = new PersonProfilePage(this.page);
      await personPage.expectLoaded();
      await personPage.goToWorkflowsTab();
      await personPage.verifyStatusInWorkflows(statusName);
      await personPage.clickBack();
      
      // Re-verify workflow profile is loaded after navigation back
      await this.profilePage.expectLoaded();
    });
  }

  async advanceWithAutoLaunch(testData: any) {
    await this.base.logger.section('Advance with auto-launch wizard', async () => {
      const statusName = testData.portalStatus || 'External Portal';
      
      await this.profilePage.selectAdvanceStatus(statusName);
      
      const modal = new OnboardingWizardModal(this.page);
      await modal.expectLoaded();
      
      if (testData.jobFolder) {
        await modal.configureJobFolder(testData.jobFolder);
      }
      
      if (testData.candidateFolder) {
        await modal.configureCandidateFolder();
      }
      
      if (testData.createEmployee) {
        await modal.configureEmployeeCreation();
      }
      
      await modal.clickOk();
      
      if (testData.category) {
        await modal.selectCategory(testData.category);
      }
      
      await modal.submitProfile();
      await modal.addTask();
      await modal.sendEmail(
        testData.emailSubject || 'Welcome Onboarding Email',
        testData.emailBody || 'Welcome to the team!'
      );
      
      this.base.logger.info('Auto-launch wizard completed successfully');
    });
  }

  async cancelEdit() {
    await this.base.logger.section('Cancel edit mode', async () => {
      await this.profilePage.clickCancel();
    });
  }
}
