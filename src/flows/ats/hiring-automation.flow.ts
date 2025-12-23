// src/flows/ats/hiring-automation.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { HiringAutomationListPage } from '@src/pages/ats/automation/hiring-automation-list.page';
import { HiringAutomationCreatePage } from '@src/pages/ats/automation/hiring-automation-create.page';
import { HiringAutomationLogsPage } from '@src/pages/ats/automation/hiring-automation-logs.page';
import { RecruitingWorkflowSearchPage } from '@src/pages/ats/workflow/recruiting-workflow-search.page';
import { RecruitingWorkflowProfilePage } from '@src/pages/ats/workflow/recruiting-workflow-profile.page';
import { PersonProfileDetailPage } from '@src/pages/ats/person/person-profile-detail.page';
import { NavigatorMenuPage } from '@src/pages/common/navigation/nav-menu.page';
import { SearchNavigationService } from '@src/services/search-navigation.service';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Link } from '@src/components/link.component';

/**
 * HiringAutomationFlow
 * Orchestrates hiring automation workflows:
 * - Navigate to Hiring Automation
 * - Create automation rules with triggers and actions
 * - Update candidate data to trigger rules
 * - Verify rule execution and text message delivery
 */
export class HiringAutomationFlow extends BaseFlow {
  private listPage: HiringAutomationListPage;
  private createPage: HiringAutomationCreatePage;
  private logsPage: HiringAutomationLogsPage;
  readonly workflowSearchPage: RecruitingWorkflowSearchPage;
  private workflowProfilePage: RecruitingWorkflowProfilePage;
  private personDetailPage: PersonProfileDetailPage;
  private navigatorMenu: NavigatorMenuPage;
  readonly searchNav: SearchNavigationService;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.listPage = new HiringAutomationListPage(page);
    this.createPage = new HiringAutomationCreatePage(page);
    this.logsPage = new HiringAutomationLogsPage(page);
    this.workflowSearchPage = new RecruitingWorkflowSearchPage(page);
    this.workflowProfilePage = new RecruitingWorkflowProfilePage(page);
    this.personDetailPage = new PersonProfileDetailPage(page);
    this.navigatorMenu = new NavigatorMenuPage(page);
    this.searchNav = new SearchNavigationService(page);
  }

  /**
   * Navigate to Hiring Automation from Admin menu
   */
  async navigateToHiringAutomation() {
    await this.navigatorMenu.navigateToAdminLink('Hiring Automation');
    await this.listPage.expectLoaded();
  }

  /**
   * Create a new automation rule with status change trigger and send text action
   */
  async createAutomationRule(testData: any) {
    await this.base.logger.section('Create automation rule', async () => {
      // Click Add New
      await this.listPage.clickAddNew();
      await this.createPage.expectLoaded();
      
      // Fill automation name
      await this.createPage.fillAutomationName(testData.automationName);
      
      // Select trigger category
      await this.createPage.selectTriggerCategory(testData.triggerCategory);
      
      // Select bin
      await this.createPage.selectBin(testData.bin);
      
      // Select status
      await this.createPage.selectStatus(testData.status);
      
      // Click Next to go to action configuration
      await this.createPage.clickNext();
      
      // Select automation type (Send Text)
      await this.createPage.selectAutomationType(testData.automationType);
      
      // Fill text body
      await this.createPage.fillTextBody(testData.textBody);
      
      // Save the rule
      await this.createPage.clickSave();
      
      // Verify rule appears in list
      await this.listPage.expectLoaded();
      await this.listPage.verifyRuleInList(testData.automationName);
    });
  }

  /**
   * Search for and open first candidate
   */
  async openFirstCandidate() {
    await this.base.logger.section('Open first candidate', async () => {
      await this.workflowSearchPage.runSearch();
      
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const firstCandidate = new Button(
        this.page,
        mainFrame.locator('table tbody tr').first(),
        'First Candidate'
      );
      await firstCandidate.click();
      
      await this.personDetailPage.expectLoaded();
    });
  }

  /**
   * Update candidate phone number
   */
  async updateCandidatePhone(phoneNumber: string) {
    await this.base.logger.section(`Update candidate phone: ${phoneNumber}`, async () => {
      await this.personDetailPage.clickDetailTab();
      await this.personDetailPage.clickEdit();
      await this.personDetailPage.updateMobilePhone(phoneNumber);
      await this.personDetailPage.clickSave();
      await this.personDetailPage.verifyPhoneNumber(phoneNumber);
    });
  }

  /**
   * Change candidate status to trigger automation
   */
  async changeStatusToTriggerRule(testData: any) {
    await this.base.logger.section('Change status to trigger automation', async () => {
      // Navigate to Jobs tab and open first submittal
      await this.personDetailPage.clickJobsTab();
      await this.personDetailPage.clickFirstSubmittal();
      
      // Change status using workflow profile page
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      
      // Click Edit button
      const editBtn = new Button(
        this.page,
        mainFrame.getByRole('button', { name: 'Edit' }),
        'Edit Button'
      );
      await editBtn.click();
      
      // Select bin
      const binDropdown = new Dropdown(
        this.page,
        mainFrame.getByLabel('Bin'),
        'Bin Dropdown'
      );
      await binDropdown.locator.click();
      const binOption = new Button(
        this.page,
        mainFrame.getByRole('option', { name: testData.bin }),
        `Bin Option: ${testData.bin}`
      );
      await binOption.click();
      
      // Select status
      const statusDropdown = new Dropdown(
        this.page,
        mainFrame.getByLabel('Status'),
        'Status Dropdown'
      );
      await statusDropdown.locator.click();
      const statusOption = new Button(
        this.page,
        mainFrame.getByRole('option', { name: testData.status }),
        `Status Option: ${testData.status}`
      );
      await statusOption.click();
      
      // Save the status change
      const saveBtn = new Button(
        this.page,
        mainFrame.getByRole('button', { name: 'Save' }),
        'Save Button'
      );
      await saveBtn.click();
    });
  }

  /**
   * Wait for automation rule to execute
   */
  async waitForRuleExecution(minutes: number = 3) {
    await this.base.logger.section(`Wait ${minutes} minutes for rule execution`, async () => {
      const milliseconds = minutes * 60 * 1000;
      await this.page.waitForTimeout(milliseconds);
    });
  }

  /**
   * Verify rule invocation in logs
   */
  async verifyRuleInvocationInLogs(automationName: string) {
    await this.base.logger.section('Verify rule invocation in logs', async () => {
      // Navigate back to Hiring Automation
      await this.navigateToHiringAutomation();
      
      // Open logs for the rule
      await this.listPage.openRuleLogs(automationName);
      await this.logsPage.expectLoaded();
      
      // Verify recent log entry
      await this.logsPage.verifyRecentLogEntry(automationName);
      await this.logsPage.verifyLogSuccess();
      await this.logsPage.verifyActionInfo('text.*sent|SMS.*sent|message.*sent');
    });
  }

  /**
   * Verify text message in Text Engagement tab
   */
  async verifyTextMessageInTextEngagement(expectedContent: string) {
    await this.base.logger.section('Verify text message in Text Engagement', async () => {
      // Navigate back to recruiting workflow search
      await this.searchNav.navigateToSearch('Recruiting Workflow');
      await this.workflowSearchPage.expectLoaded();
      await this.openFirstCandidate();
      
      // Click Text Engagement tab
      await this.personDetailPage.clickTextEngagementTab();
      
      // Verify text message
      await this.personDetailPage.verifyTextMessage(expectedContent);
    });
  }
}
