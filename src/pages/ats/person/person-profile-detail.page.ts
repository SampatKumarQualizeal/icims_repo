// src/pages/ats/person-profile-detail.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileDetailPage
 * Handle person profile details including phone number updates and text engagement
 */
export class PersonProfileDetailPage extends BasePage {
  protected mainFrame?: FrameLocator;
  readonly detailTab: Button;
  readonly jobsTab: Button;
  readonly textEngagementTab: Button;
  readonly editBtn: Button;
  readonly saveBtn: Button;
  readonly mobilePhoneInput: Input;
  readonly validationErrorMsg: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Detail Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.detailTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Detail' }),
      'Detail Tab'
    );
    
    this.jobsTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Jobs' }),
      'Jobs Tab'
    );
    
    this.textEngagementTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Text Engagement' }),
      'Text Engagement Tab'
    );
    
    this.editBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Edit' }),
      'Edit Button'
    );
    
    this.saveBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.mobilePhoneInput = new Input(
      page,
      mainFrame.getByLabel('Mobile Phone'),
      'Mobile Phone Input'
    );
    
    this.validationErrorMsg = new Div(
      page,
      mainFrame.locator('.validation-error, .error-message, [class*="error"]').first(),
      'Validation Error Message'
    );
  }

  async expectLoaded() {
    await this.section('Person Profile Detail - verify loaded', async () => {
      const personHeading = new Div(
        this.page,
        this.mainFrame!.getByRole('heading', { name: /Person/i }),
        'Person Heading'
      );
      await personHeading.expectVisible();
    });
  }

  async clickDetailTab() {
    await this.section('Click Detail tab', async () => {
      await this.detailTab.click();
    });
  }

  async clickJobsTab() {
    await this.section('Click Jobs tab', async () => {
      await this.jobsTab.click();
    });
  }

  async clickTextEngagementTab() {
    await this.section('Click Text Engagement tab', async () => {
      await this.textEngagementTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
    });
  }

  async updateMobilePhone(phoneNumber: string) {
    await this.section(`Update mobile phone: ${phoneNumber}`, async () => {
      await this.mobilePhoneInput.clear();
      await this.mobilePhoneInput.fill(phoneNumber);
    });
  }

  async clickSave() {
    await this.section('Save changes', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyPhoneNumber(phoneNumber: string) {
    await this.section(`Verify phone number: ${phoneNumber}`, async () => {
      const value = await this.mobilePhoneInput.inputValue();
      if (value !== phoneNumber) {
        throw new Error(`Phone number mismatch. Expected: ${phoneNumber}, Actual: ${value}`);
      }
    });
  }

  async verifyTextMessage(expectedContent: string) {
    await this.section('Verify text message in Text Engagement', async () => {
      const messageContainer = new Div(
        this.page,
        this.mainFrame!.locator('[data-testid="text-message"]').first(),
        'Text Message Container'
      );
      await messageContainer.expectVisible();
      
      const messageText = await messageContainer.getText();
      if (!messageText.includes(expectedContent)) {
        throw new Error(`Text message does not contain: ${expectedContent}`);
      }
      
      // Verify no variable placeholders remain
      if (messageText.includes('{First Name}') || messageText.includes('{Last Name}') || 
          messageText.includes('{Job Title}') || messageText.includes('{Company Name}')) {
        throw new Error('Text message contains unpopulated variable placeholders');
      }
    });
  }

  async clickFirstSubmittal() {
    await this.section('Click first submittal', async () => {
      const firstSubmittal = new Button(
        this.page,
        this.mainFrame!.locator('table tbody tr').first(),
        'First Submittal'
      );
      await firstSubmittal.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Fill a text field that has re-enter validation enabled
   * @param fieldLabel - The label of the field (e.g., 'Custom Text Field')
   * @param value - Value to enter in the original field
   * @param reenterValue - Value to enter in the re-enter field
   */
  async fillFieldWithReenter(fieldLabel: string, value: string, reenterValue: string) {
    await this.section(`Fill ${fieldLabel} with re-enter validation`, async () => {
      const originalField = new Input(
        this.page,
        this.mainFrame!.getByLabel(fieldLabel).first(),
        `${fieldLabel} Original Field`
      );
      
      const reenterField = new Input(
        this.page,
        this.mainFrame!.getByLabel(`Re-enter ${fieldLabel}`).or(
          this.mainFrame!.getByLabel(`Confirm ${fieldLabel}`)
        ).first(),
        `${fieldLabel} Re-enter Field`
      );
      
      await originalField.fill(value);
      await reenterField.fill(reenterValue);
    });
  }

  /**
   * Verify validation error message is displayed for field mismatch
   */
  async verifyValidationError() {
    await this.section('Verify validation error for field mismatch', async () => {
      await this.validationErrorMsg.expectVisible();
      const errorText = await this.validationErrorMsg.getText();
      if (!errorText.toLowerCase().includes('match') && !errorText.toLowerCase().includes('equal')) {
        throw new Error(`Validation error message unexpected: ${errorText}`);
      }
    });
  }

  /**
   * Verify profile was saved successfully (no error visible, save button hidden)
   */
  async verifyProfileSaved() {
    await this.section('Verify profile saved successfully', async () => {
      // Verify save button is not visible (edit mode exited)
      await this.saveBtn.expectHidden();
      // Verify no validation errors remain
      await this.validationErrorMsg.expectHidden();
    });
  }
}
