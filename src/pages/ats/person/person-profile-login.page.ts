// src/pages/ats/person/person-profile-login.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileLoginPage
 * Handles the Login tab of a person profile with password field validation
 * 
 * Structure: Main iframe > Login tab > Nested iframe (icims-classic-data-container)
 * Contains: Password and Password (Retype) fields with re-enter validation
 */
export class PersonProfileLoginPage extends BasePage {
  protected mainFrame?: FrameLocator;
  protected loginFrame?: FrameLocator;
  
  readonly loginTab: Button;  
  readonly editBtn: Button;
  readonly saveBtn: Button;
  readonly passwordInput: Input;
  readonly retypePasswordInput: Input;
  readonly alertError: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context - nested structure
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super with main frame body
    super(page, mainFrame.locator('body'), 'Person Profile Login Page');
    
    // STEP 3: Store frameLocator references
    this.mainFrame = mainFrame;
    const loginFrame = mainFrame.locator('iframe[name="target_frame_left"]').contentFrame();
    this.loginFrame = loginFrame;
    
    // STEP 4: Instantiate components
    // Login tab is in main frame
    this.loginTab = new Button(
      page,      
      mainFrame.getByRole('menuitem', { name: 'Login' }),
      'Login Tab'
    );
    
    // Edit/Save buttons and inputs are in nested login frame
    this.editBtn = new Button(
      page,
        loginFrame.getByRole('button', { name: ' Edit' }),
      'Edit Button'
    );
    
    this.saveBtn = new Button(
      page,      
      loginFrame.getByRole('button', { name: ' Save' }),
      'Save Button'
    );
    
    this.passwordInput = new Input(
      page,
      loginFrame.getByRole('textbox', { name: 'Password Password (Re-enter)' }),
      'Password Field'
    );
    
    this.retypePasswordInput = new Input(
      page,
      loginFrame.getByRole('textbox', { name: 'Minimum 8 characters, 1' }),
      'Password Retype Field'
    );
    
    // Validation error messages
    this.alertError = new Div(
      page,     
      loginFrame.getByText('There was a validation error. Field: Password Reason: Please ensure that both'),
      'Validation Alert Error'
    );
  }

  async expectLoaded() {
    await this.section('Person Profile Login - verify loaded', async () => {
      await this.loginTab.expectVisible();
    });
  }
  async clickMoreButton() {
    await this.section('Click More button', async () => {
      const moreButton = this.page.locator('[data-testid="main-body-iframe"]').contentFrame().getByRole('tab', { name: 'More' });
      await moreButton.click();
    });
  }

  async clickLoginTab() {
    await this.section('Click Login tab', async () => {
      await this.loginTab.expectVisible();
      await this.loginTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
    });
  }

  async fillPasswordFields(password: string, retypePassword: string) {
    await this.section('Fill password fields', async () => {
      await this.passwordInput.fill(password);
      await this.retypePasswordInput.fill(retypePassword);
    });
  }

  async clickSave() {
    await this.section('Click Save button', async () => {
      await this.saveBtn.click();
    });
  }

  async verifyValidationErrors(expectedAlertMessage: string, expectedInlineMessage: string) {
    await this.section('Verify validation errors displayed', async () => {
      // Verify alert error message
      await this.alertError.expectVisible();
      const alertText = await this.alertError.getText();
      
      if (!alertText.includes(expectedAlertMessage)) {
        throw new Error(`Alert message mismatch. Expected to contain: "${expectedAlertMessage}", Actual: "${alertText}"`);
      }
      
      if (!alertText.includes(expectedInlineMessage)) {
        throw new Error(`Alert message missing error detail. Expected: "${expectedInlineMessage}", Actual: "${alertText}"`);
      }
      
      // Verify inline error message (dynamically locate based on expected message)
      const inlineError = new Div(
        this.page,       
        this.loginFrame!.getByText('Reason: Please ensure that both'),        
        'Inline Validation Error'
      );
      await inlineError.expectVisible();
      const inlineText = await inlineError.getText();
      
      if (!inlineText.includes(expectedInlineMessage)) {
        throw new Error(`Inline error mismatch. Expected: "${expectedInlineMessage}", Actual: "${inlineText}"`);
      }
    });
  }
}
