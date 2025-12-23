// src/flows/ats/hcm/adp-prehire.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { NavigatorMenuPage } from '@src/pages/common/navigation/nav-menu.page';
import { PeopleMenuPage } from '@src/pages/common/navigation/people-menu.page';
import { PersonAddSimplePage } from '@src/pages/ats/person/person-add-simple.page';
import { PersonSubmitToRequisitionPage } from '@src/pages/ats/person/person-submit-to-requisition.page';
import { PersonWorkflowsTabPage } from '@src/pages/ats/person/person-workflows-tab.page';
import { WorkflowProfilePage } from '@src/pages/ats/workflow/workflow-profile.page';
import { PersonEmployeeInfoTabPage } from '@src/pages/ats/person/person-employee-info-tab.page';

/**
 * ADPPrehireFlow
 * Orchestrates ADP WFN Pre-hire integration workflow:
 * - Create candidate via Navigator > People > Add Person
 * - Submit candidate to job/requisition
 * - Advance to Hired status
 * - Fill Employee Info with ADP-required fields
 * - Advance to HCM Connector Prehire status
 * 
 * Note: This is PARTIAL AUTOMATION - Workato and ADP verification are MANUAL steps
 */
export class ADPPrehireFlow extends BaseFlow {
  private navMenu: NavigatorMenuPage;
  private peopleMenu: PeopleMenuPage;
  private addPersonPage: PersonAddSimplePage;
  private submitToRequisitionPage: PersonSubmitToRequisitionPage;
  private workflowsTabPage: PersonWorkflowsTabPage;
  private workflowProfilePage: WorkflowProfilePage;
  private employeeInfoTabPage: PersonEmployeeInfoTabPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.navMenu = new NavigatorMenuPage(page);
    this.peopleMenu = new PeopleMenuPage(page);
    this.addPersonPage = new PersonAddSimplePage(page);
    this.submitToRequisitionPage = new PersonSubmitToRequisitionPage(page);
    this.workflowsTabPage = new PersonWorkflowsTabPage(page);
    this.workflowProfilePage = new WorkflowProfilePage(page);
    this.employeeInfoTabPage = new PersonEmployeeInfoTabPage(page);
  }

  /**
   * Create candidate via Navigator > People > Add Person
   */
  async createCandidate(testData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    await this.base.logger.section('Create candidate in iCIMS', async () => {
      // Navigate to Add Person
      await this.navMenu.openNavigator();
      await this.navMenu.clickPeople();
      await this.peopleMenu.clickAddPerson();
      
      // Fill person information
      await this.addPersonPage.fillPersonInformation({
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email,
        phone: testData.phone
      });
      
      // Save
      await this.addPersonPage.clickSave();
      
      // Verify creation
      await this.addPersonPage.verifyPersonCreated(testData.firstName, testData.lastName);
      
      this.base.logger.info(`✓ Candidate created: ${testData.firstName} ${testData.lastName}`);
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
   * Advance candidate to Hired status
   */
  async advanceToHired() {
    await this.base.logger.section('Advance candidate to Hired status', async () => {
      // Navigate to Workflows tab
      await this.workflowsTabPage.clickWorkflowsTab();
      
      // Click on workflow entry (assumes "Test Job" for now)
      await this.workflowsTabPage.clickWorkflowEntry('Test Job');
      
      // Advance to Hired
      await this.workflowProfilePage.clickAdvance();
      await this.workflowProfilePage.selectStatus('Hired');
      await this.workflowProfilePage.clickOk();
      
      this.base.logger.info('✓ Candidate advanced to Hired status');
    });
  }

  /**
   * Fill Employee Info with ADP-required fields
   */
  async fillEmployeeInfo(testData: {
    hireDate: string;
    ssn: string;
    dob: string;
    payGroup: string;
    onboardingTemplate: string;
    onboardingExperience: string;
  }) {
    await this.base.logger.section('Fill Employee Info with ADP fields', async () => {
      // Navigate to Employee Info tab
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      
      // Click Edit
      await this.employeeInfoTabPage.clickEdit();
      
      // Fill ADP-specific fields
      await this.employeeInfoTabPage.fillADPFields({
        hireDate: testData.hireDate,
        ssn: testData.ssn,
        dob: testData.dob,
        payGroup: testData.payGroup,
        onboardingTemplate: testData.onboardingTemplate,
        onboardingExperience: testData.onboardingExperience
      });
      
      // Save
      await this.employeeInfoTabPage.clickSave();
      
      this.base.logger.info('✓ Employee Info saved with ADP fields');
    });
  }

  /**
   * Advance candidate to HCM Connector Prehire status
   */
  async advanceToHCMConnectorPrehire() {
    await this.base.logger.section('Advance to HCM Connector Prehire', async () => {
      // Navigate to Workflows tab
      await this.workflowsTabPage.clickWorkflowsTab();
      
      // Click on workflow entry
      await this.workflowsTabPage.clickWorkflowEntry('Test Job');
      
      // Verify currently in Hired status
      await this.workflowProfilePage.verifyBinStatus('Hired', 'Hired');
      
      // Advance to HCM Connector Prehire
      await this.workflowProfilePage.clickAdvance();
      await this.workflowProfilePage.selectStatus('HCM Connector.*Prehire');
      await this.workflowProfilePage.clickOk();
      
      this.base.logger.info('✓ Candidate advanced to HCM Connector Prehire');
      this.base.logger.info('→ MANUAL STEP: Verify Workato recipe execution and ADP integration');
    });
  }

  /**
   * Verify Employee ID/Associate OID populated (after Workato callback)
   */
  async verifyEmployeeIdPopulated() {
    await this.base.logger.section('Verify Employee ID populated', async () => {
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      await this.employeeInfoTabPage.verifyEmployeeIdPopulated();
    });
  }
}
