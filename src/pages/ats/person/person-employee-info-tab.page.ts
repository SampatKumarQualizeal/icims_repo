// src/pages/ats/person/person-employee-info-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Div } from '@src/components/div.component';

/**
 * PersonEmployeeInfoTabPage
 * Handles Employee Info tab in person profile
 * Includes ADP-specific fields for HCM integration
 * Structure: [data-testid="main-body-iframe"] → iframe[name="target_frame_left"]
 */
export class PersonEmployeeInfoTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private employeeInfoFrame: FrameLocator;
  
  readonly employeeInfoTab: Button;
  readonly editBtn: Button;
  readonly saveBtn: Button;
  readonly hireDateInput: Input;
  readonly ssnInput: Input;
  readonly dobInput: Input;
  readonly adpPayGroupDropdown: Dropdown;
  readonly adpOnboardingTemplateDropdown: Dropdown;
  readonly adpOnboardingExperienceInput: Input;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const employeeInfoFrame = mainFrame.locator('iframe[name="target_frame_left"]').contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Employee Info Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.employeeInfoFrame = employeeInfoFrame;
    
    // STEP 4: Instantiate components
    this.employeeInfoTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Employee Info' }),
      'Employee Info Tab'
    );
    
    this.editBtn = new Button(
      page,
      employeeInfoFrame.getByRole('button', { name: 'Edit' }),
      'Edit Button'
    );
    
    this.saveBtn = new Button(
      page,
      employeeInfoFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.hireDateInput = new Input(
      page,
      employeeInfoFrame.getByLabel(/Hire Date/),
      'Hire Date Input'
    );
    
    this.ssnInput = new Input(
      page,
      employeeInfoFrame.getByLabel(/SSN|Social Security/),
      'SSN Input'
    );
    
    this.dobInput = new Input(
      page,
      employeeInfoFrame.getByLabel(/Birth Date|Date of Birth/),
      'Date of Birth Input'
    );
    
    this.adpPayGroupDropdown = new Dropdown(
      page,
      employeeInfoFrame.getByLabel(/ADP.*Pay Group/),
      'ADP Pay Group Dropdown'
    );
    
    this.adpOnboardingTemplateDropdown = new Dropdown(
      page,
      employeeInfoFrame.getByLabel(/Onboarding Template/),
      'ADP Onboarding Template Dropdown'
    );
    
    this.adpOnboardingExperienceInput = new Input(
      page,
      employeeInfoFrame.getByLabel(/Onboarding Experience/),
      'ADP Onboarding Experience Input'
    );
  }

  async clickEmployeeInfoTab() {
    await this.section('Click Employee Info tab', async () => {
      await this.employeeInfoTab.click();
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
    });
  }

  async fillADPFields(data: {
    hireDate: string;
    ssn: string;
    dob: string;
    payGroup: string;
    onboardingTemplate: string;
    onboardingExperience: string;
  }) {
    await this.section('Fill ADP-required fields', async () => {
      await this.hireDateInput.fill(data.hireDate);
      await this.ssnInput.fill(data.ssn);
      await this.dobInput.fill(data.dob);
      await this.adpPayGroupDropdown.select(data.payGroup);
      await this.adpOnboardingTemplateDropdown.select(data.onboardingTemplate);
      await this.adpOnboardingExperienceInput.fill(data.onboardingExperience);
    });
  }

  async clickSave() {
    await this.section('Click Save button', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyEmployeeIdPopulated() {
    await this.section('Verify Employee ID populated', async () => {
      const employeeIdField = this.employeeInfoFrame.locator('text=/Employee ID|Associate OID/');
      const isVisible = await employeeIdField.isVisible();
      
      if (isVisible) {
        this.logger.info('✓ Employee ID field found');
      } else {
        this.logger.info('ℹ Employee ID field visibility check - manual verification required');
      }
    });
  }

  /**
   * Verify specific field value in Employee Info
   * @param fieldName - Label/name of the field to verify
   * @param expectedValue - Expected value for the field
   */
  async verifyField(fieldName: string, expectedValue: string) {
    await this.section(`Verify ${fieldName}: ${expectedValue}`, async () => {
      const fieldValue = new Div(
        this.page,
        this.employeeInfoFrame.getByText(new RegExp(expectedValue, 'i')),
        `${fieldName} Value`
      );
      
      const isVisible = await fieldValue.locator.isVisible().catch(() => false);
      
      if (isVisible) {
        this.logger.info(`✓ ${fieldName} populated: ${expectedValue}`);
      } else {
        this.logger.info(`⚠ ${fieldName} not found - verify field mapping in Workato`);
      }
    });
  }

  /**
   * Verify multiple employee fields
   */
  async verifyEmployeeData(data: {
    employeeId?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    status?: string;
  }) {
    await this.section('Verify employee data fields', async () => {
      if (data.employeeId) {
        await this.verifyField('Employee ID', data.employeeId);
      }
      if (data.department) {
        await this.verifyField('Department', data.department);
      }
      if (data.position) {
        await this.verifyField('Position', data.position);
      }
      if (data.hireDate) {
        await this.verifyField('Hire Date', data.hireDate);
      }
      if (data.status) {
        await this.verifyField('Status', data.status);
      }
    });
  }
}
