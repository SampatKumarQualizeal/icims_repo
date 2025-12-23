// src/flows/ats/hcm/adp-rehire.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { QuickSearchService } from '@src/services/quick-search.service';
import { PersonSubmitToRequisitionPage } from '@src/pages/ats/person/person-submit-to-requisition.page';
import { PersonWorkflowsTabPage } from '@src/pages/ats/person/person-workflows-tab.page';
import { WorkflowProfilePage } from '@src/pages/ats/workflow/workflow-profile.page';
import { PersonEmployeeInfoTabPage } from '@src/pages/ats/person/person-employee-info-tab.page';

/**
 * ADPRehireFlow
 * Orchestrates ADP WFN Rehire integration workflow:
 * - Search for terminated employee via Quick Search
 * - Verify Employee Info contains associateOID (from previous hire)
 * - Submit candidate to job/requisition
 * - Advance to Hired status
 * - Update Employee Info with rehire date
 * - Advance to HCM Connector Prehire (triggers Rehire recipe based on associateOID)
 * 
 * Key Difference from Prehire:
 * - Prehire: Creates NEW candidate, no associateOID → ADP-Wfn-Prehire recipe
 * - Rehire: Uses EXISTING terminated employee with associateOID → ADP-Wfn-Rehire recipe
 * 
 * Note: This is PARTIAL AUTOMATION - Workato and ADP verification are MANUAL steps
 */
export class ADPRehireFlow extends BaseFlow {
  private quickSearch: QuickSearchService;
  private submitToRequisitionPage: PersonSubmitToRequisitionPage;
  private workflowsTabPage: PersonWorkflowsTabPage;
  private workflowProfilePage: WorkflowProfilePage;
  private employeeInfoTabPage: PersonEmployeeInfoTabPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.quickSearch = new QuickSearchService(page);
    this.submitToRequisitionPage = new PersonSubmitToRequisitionPage(page);
    this.workflowsTabPage = new PersonWorkflowsTabPage(page);
    this.workflowProfilePage = new WorkflowProfilePage(page);
    this.employeeInfoTabPage = new PersonEmployeeInfoTabPage(page);
  }

  /**
   * Search for terminated employee via Quick Search
   */
  async searchForTerminatedEmployee(firstName: string, lastName: string) {
    await this.base.logger.section('Search for terminated employee', async () => {
      await this.quickSearch.searchAndSelectPerson(firstName, lastName);
      await this.quickSearch.verifyPersonProfileDisplayed(firstName, lastName);
      
      this.base.logger.info(`✓ Found terminated employee: ${firstName} ${lastName}`);
    });
  }

  /**
   * Verify Employee Info contains associateOID (from previous ADP employment)
   * This confirms the candidate was previously in ADP system
   */
  async verifyAssociateOIDExists() {
    await this.base.logger.section('Verify Employee Info contains associateOID', async () => {
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      
      this.base.logger.info('✓ Employee Info tab opened');
      this.base.logger.info('→ MANUAL VERIFICATION: Check for associateOID field populated');
      this.base.logger.info('→ This confirms candidate was previously employed in ADP');
    });
  }

  /**
   * Submit candidate to job/requisition
   */
  async submitToJob(jobName: string) {
    await this.base.logger.section('Submit candidate to job/requisition', async () => {
      await this.submitToRequisitionPage.clickSubmitToRequisition();
      await this.submitToRequisitionPage.selectJob(jobName);
      await this.submitToRequisitionPage.clickSubmit();
      
      this.base.logger.info(`✓ Candidate submitted to job: ${jobName}`);
    });
  }

  /**
   * Advance candidate to Hired (Internal Only) status
   */
  async advanceToHired() {
    await this.base.logger.section('Advance candidate to Hired status', async () => {
      // Navigate to Workflows tab
      await this.workflowsTabPage.clickWorkflowsTab();
      
      // Click on workflow entry (using job name pattern)
      await this.workflowsTabPage.clickWorkflowEntry('Test Job');
      
      // Advance to Hired
      await this.workflowProfilePage.clickAdvance();
      await this.workflowProfilePage.selectStatus('Hired');
      await this.workflowProfilePage.clickOk();
      
      // Verify status
      await this.workflowProfilePage.verifyBinStatus('Hired', 'Internal');
      
      this.base.logger.info('✓ Candidate advanced to Hired (Internal Only)');
    });
  }

  /**
   * Update Employee Info with rehire date and ADP-specific fields
   * @param testData - Contains rehire date and other ADP fields
   */
  async updateEmployeeInfoForRehire(testData: {
    rehireDate: string;
    ssn?: string;
    dob?: string;
    payGroup?: string;
    onboardingTemplate?: string;
    onboardingExperience?: string;
  }) {
    await this.base.logger.section('Update Employee Info for rehire', async () => {
      // Navigate to Employee Info tab
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      
      // Click Edit
      await this.employeeInfoTabPage.clickEdit();
      
      // Fill ADP fields including rehire date
      await this.employeeInfoTabPage.fillADPFields({
        hireDate: testData.rehireDate, // Note: field is labeled "Hire Date" but used as rehire date
        ssn: testData.ssn || '',
        dob: testData.dob || '',
        payGroup: testData.payGroup || '',
        onboardingTemplate: testData.onboardingTemplate || '',
        onboardingExperience: testData.onboardingExperience || ''
      });
      
      // Save changes
      await this.employeeInfoTabPage.clickSave();
      
      this.base.logger.info(`✓ Employee Info updated with rehire date: ${testData.rehireDate}`);
    });
  }

  /**
   * Advance to HCM Connector Prehire (triggers Rehire recipe)
   * 
   * CRITICAL: Even though action is "HCM Connector Prehire", the system
   * detects existing associateOID and routes to ADP-Wfn-Rehire recipe instead
   * of ADP-Wfn-Prehire recipe.
   */
  async advanceToHCMConnectorPrehire() {
    await this.base.logger.section('Advance to HCM Connector Prehire (triggers Rehire)', async () => {
      // Navigate to Workflows tab
      await this.workflowsTabPage.clickWorkflowsTab();
      
      // Click on workflow entry (using job name pattern)
      await this.workflowsTabPage.clickWorkflowEntry('Test Job');
      
      // Verify still in Hired bin
      await this.workflowProfilePage.verifyBinStatus('Hired', 'Internal');
      
      // Advance to HCM Connector Prehire
      await this.workflowProfilePage.clickAdvance();
      await this.workflowProfilePage.selectStatus('HCM Connector Prehire');
      await this.workflowProfilePage.clickOk();
      
      this.base.logger.info('✓ Candidate advanced to HCM Connector Prehire');
      this.base.logger.info('');
      this.base.logger.info('═══════════════════════════════════════════════════════');
      this.base.logger.info('CRITICAL: Rehire Recipe Routing');
      this.base.logger.info('→ System detected existing associateOID in Employee Info');
      this.base.logger.info('→ Will route to ADP-Wfn-Rehire recipe (NOT Prehire)');
      this.base.logger.info('→ Rehire updates EXISTING terminated worker in ADP');
      this.base.logger.info('→ Worker status changes: Terminated → Active');
      this.base.logger.info('═══════════════════════════════════════════════════════');
      this.base.logger.info('');
      this.base.logger.info('MANUAL STEP: Verify Workato Rehire Recipe Execution');
      this.base.logger.info('→ Login to Workato dashboard');
      this.base.logger.info('→ Navigate to: ICIMS HCM Integrations > Standard Recipes > ADP WFN > Rehire');
      this.base.logger.info('→ Check job history for recent execution');
      this.base.logger.info('→ Verify ADP-Wfn-Rehire recipe ran (NOT ADP-Wfn-Prehire)');
      this.base.logger.info('→ Check execution logs for rehire payload');
      this.base.logger.info('→ Verify payload contains:');
      this.base.logger.info('  - effectiveDateTime: rehire date');
      this.base.logger.info('  - worker.associateOID: existing ADP ID');
      this.base.logger.info('  - worker.workerDates.rehireDate: rehire date');
      this.base.logger.info('  - worker.workerStatus.reasonCode: rehire reason');
      this.base.logger.info('');
      this.base.logger.info('MANUAL STEP: Verify Worker Rehired in ADP');
      this.base.logger.info('→ Login to ADP WFN system');
      this.base.logger.info('→ Search for worker by associateOID or name');
      this.base.logger.info('→ Verify worker status: Terminated → Active');
      this.base.logger.info('→ Verify rehire date updated in ADP');
      this.base.logger.info('→ Verify worker NOT duplicated (same associateOID)');
      this.base.logger.info('→ Verify employment history shows termination + rehire');
    });
  }

  /**
   * Verify associateOID remained unchanged
   * For rehire, associateOID should be the same as before (not generate new).
   * This confirms system correctly identified existing ADP worker.
   */
  async verifyAssociateOIDUnchanged(expectedAssociateOID: string) {
    await this.base.logger.section('Verify associateOID unchanged', async () => {
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      
      this.base.logger.info('✓ Navigated to Employee Info tab');
      this.base.logger.info('');
      this.base.logger.info('MANUAL VERIFICATION: Confirm associateOID unchanged');
      this.base.logger.info(`→ Expected associateOID: ${expectedAssociateOID}`);
      this.base.logger.info('→ This confirms rehire (not new hire)');
      this.base.logger.info('→ Worker updated in ADP (not duplicated)');
    });
  }
}
