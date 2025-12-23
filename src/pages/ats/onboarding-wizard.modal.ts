// src/pages/ats/onboarding-wizard.modal.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * OnboardingWizardModal
 * Modal that appears when advancing to External Portal status
 * Handles job folder, candidate folder, employee creation, and email configuration
 */
export class OnboardingWizardModal extends BasePage {
  readonly jobFolderCheckbox: Checkbox;
  readonly jobFolderDropdown: Dropdown;
  readonly candidateFolderCheckbox: Checkbox;
  readonly createEmployeeCheckbox: Checkbox;
  readonly okButton: Button;
  readonly categoryFilterDropdown: Dropdown;
  readonly submitButton: Button;
  readonly taskCheckbox: Checkbox;
  readonly addTaskButton: Button;
  readonly subjectInput: Input;
  readonly bodyInput: Input;
  readonly sendButton: Button;

  constructor(page: Page) {
    // STEP 1: Modal on main page (not in iframe)
    const modalLoc = page.locator('.ui-dialog').first();
    
    // STEP 2: Call super
    super(page, modalLoc, 'Onboarding Wizard Modal');
    
    // STEP 4: Instantiate components
    // TODO: Replace with data-testid when available
    this.jobFolderCheckbox = new Checkbox(
      page,
      modalLoc.locator('input[type="checkbox"]').first(),
      'Job Folder Checkbox'
    );
    
    this.jobFolderDropdown = new Dropdown(
      page,
      modalLoc.locator('select').first(),
      'Job Folder Dropdown'
    );
    
    // TODO: Verify nth-child index for candidate folder checkbox
    this.candidateFolderCheckbox = new Checkbox(
      page,
      modalLoc.locator('input[type="checkbox"]').nth(1),
      'Candidate Folder Checkbox'
    );
    
    // TODO: Verify nth-child index for employee checkbox
    this.createEmployeeCheckbox = new Checkbox(
      page,
      modalLoc.locator('input[type="checkbox"]').nth(2),
      'Create Employee Checkbox'
    );
    
    this.okButton = new Button(
      page,
      modalLoc.getByRole('button', { name: /OK/i }),
      'OK Button'
    );
    
    // TODO: Verify dropdown selector for category filter
    this.categoryFilterDropdown = new Dropdown(
      page,
      modalLoc.locator('select').nth(1),
      'Category Filter Dropdown'
    );
    
    this.submitButton = new Button(
      page,
      modalLoc.getByRole('button', { name: /Submit/i }),
      'Submit Button'
    );
    
    this.taskCheckbox = new Checkbox(
      page,
      modalLoc.locator('input[type="checkbox"]').first(),
      'Task Checkbox'
    );
    
    this.addTaskButton = new Button(
      page,
      modalLoc.getByRole('button', { name: /Add.*task/i }),
      'Add Task Button'
    );
    
    // TODO: Replace with actual input selector
    this.subjectInput = new Input(
      page,
      modalLoc.locator('input[name*="subject"]').first(),
      'Email Subject'
    );
    
    this.bodyInput = new Input(
      page,
      modalLoc.locator('textarea').first(),
      'Email Body'
    );
    
    this.sendButton = new Button(
      page,
      modalLoc.getByRole('button', { name: /Send/i }),
      'Send Email Button'
    );
  }

  async expectLoaded() {
    await this.section('Onboarding Wizard - verify loaded', async () => {
      await this.okButton.expectVisible();
    });
  }

  async selectProfileOption() {
    await this.section('Select profile option', async () => {
      // TODO: Verify selector for profile option
      const profileOption = new Div(
        this.page,
        this.root.locator('[role="option"]').first(),
        'Profile Option'
      );
      await profileOption.dblclick();
    });
  }

  async configureJobFolder(folderName: string) {
    await this.section(`Configure job folder: ${folderName}`, async () => {
      await this.jobFolderCheckbox.check();
      await this.jobFolderDropdown.select(folderName);
    });
  }

  async configureCandidateFolder() {
    await this.section('Configure candidate folder', async () => {
      await this.candidateFolderCheckbox.check();
    });
  }

  async configureEmployeeCreation() {
    await this.section('Configure employee creation', async () => {
      await this.createEmployeeCheckbox.check();
    });
  }

  async clickOk() {
    await this.section('Click OK', async () => {
      await this.okButton.click();
    });
  }

  async selectCategory(categoryName: string) {
    await this.section(`Select category: ${categoryName}`, async () => {
      await this.categoryFilterDropdown.select(categoryName);
    });
  }

  async submitProfile() {
    await this.section('Submit profile selection', async () => {
      await this.selectProfileOption();
      await this.submitButton.click();
    });
  }

  async addTask() {
    await this.section('Add task', async () => {
      await this.taskCheckbox.check();
      await this.addTaskButton.click();
    });
  }

  async sendEmail(subject: string, body: string) {
    await this.section('Send email', async () => {
      await this.subjectInput.fill(subject);
      await this.bodyInput.fill(body);
      await this.sendButton.click();
    });
  }
}
