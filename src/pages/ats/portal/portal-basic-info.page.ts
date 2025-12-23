// src/pages/ats/portal/portal-basic-info.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

/**
 * PortalBasicInfoPage
 * Step 1 of 3: Basic Information page where candidate profile is created
 * Includes: First Name, Last Name, Login, Password, Password (Re-enter)
 * Renders inside: iframe[name="icims_content_iframe"]
 */
export class PortalBasicInfoPage extends BasePage {
  private contentFrame: FrameLocator;
  
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly loginInput: Input;
  readonly passwordInput: Input;
  readonly retypePasswordInput: Input;
  readonly submitProfileBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Portal Basic Info Page');
    
    // STEP 3: Store frameLocator
    this.contentFrame = contentFrame;
    
    // STEP 4: Instantiate components
    this.firstNameInput = new Input(
      page,
      contentFrame.getByLabel('First Name *'),
      'First Name Input'
    );
    
    this.lastNameInput = new Input(
      page,
      contentFrame.getByLabel('Last Name *'),
      'Last Name Input'
    );
    
    this.loginInput = new Input(
      page,
      contentFrame.getByLabel('Login *'),
      'Login Input'
    );
    
    this.passwordInput = new Input(
      page,
      contentFrame.getByLabel('Password * Minimum 8'),
      'Password Input'
    );
    
    this.retypePasswordInput = new Input(
      page,
      contentFrame.getByLabel('Password (Re-enter) *'),
      'Password Re-enter Input'
    );
    
    this.submitProfileBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Submit Profile' }),
      'Submit Profile Button'
    );
  }

  async fillBasicInfo(testData: {
    firstName: string;
    lastName: string;
    login: string;
    password: string;
  }) {
    await this.section('Fill Basic Information', async () => {
      await this.firstNameInput.fill(testData.firstName);
      await this.lastNameInput.fill(testData.lastName);
      await this.loginInput.fill(testData.login);
      await this.passwordInput.fill(testData.password);
      await this.retypePasswordInput.fill(testData.password);
    });
  }

  async submitProfile() {
    await this.section('Submit Basic Profile', async () => {
      await this.submitProfileBtn.click();
    });
  }
}
