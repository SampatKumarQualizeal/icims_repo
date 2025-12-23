import { Page, FrameLocator, FileChooser } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Label } from '@src/components/label.component';

/**
 * PersonCreateWizardPage
 * Multi-step person creation wizard (Navigator > Create > Person > Person)
 * 
 * Steps:
 * 1. Basic Information (First Name, Last Name, Email)
 * 2. Documents (Upload resume/documents)
 * 3. Login Information (Password with re-enter validation)
 * 
 * Features:
 * - Password validation with re-enter field
 * - Document upload via file chooser
 * - Multi-step wizard navigation (Next Screen, Finish)
 */
export class PersonCreateWizardPage extends BasePage {
  protected frameLocator?: FrameLocator;
  
  // Step 1: Basic Information
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly emailInput: Input;
  
  // Step 2: Documents
  readonly newDocumentBtn: Button;
  readonly additionalDocumentsBtn: Button;
  readonly documentOkBtn: Button;
  
  // Step 3: Login Information
  readonly passwordInput: Input;
  readonly reenterPasswordInput: Input;
  readonly passwordMismatchError: Label;
  
  // Navigation
  readonly nextScreenBtn: Button;
  readonly finishBtn: Button;
  
  // Success indicators
  readonly successHeading: Label;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('iframe');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Create Wizard Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    // Step 1: Basic Information
    this.firstNameInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: 'First Name*' }),
      'First Name Input'
    );
    
    this.lastNameInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: 'Last Name*' }),
      'Last Name Input'
    );
    
    this.emailInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: 'Email*' }),
      'Email Input'
    );
    
    // Step 2: Documents
    this.newDocumentBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'New' }),
      'New Document Button'
    );
    
    this.additionalDocumentsBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Additional Documents' }),
      'Additional Documents Button'
    );
    
    this.documentOkBtn = new Button(
      page,
      page.getByRole('button', { name: 'OK' }),
      'Document OK Button'
    );
    
    // Step 3: Login Information
    this.passwordInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: /Password/ }).first(),
      'Password Input'
    );
    
    this.reenterPasswordInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: /Re-enter/ }),
      'Re-enter Password Input'
    );
    
    this.passwordMismatchError = new Label(
      page,
      mainFrame.getByText('Please ensure that both password fields match.'),
      'Password Mismatch Error'
    );
    
    // Navigation
    this.nextScreenBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Next Screen' }),
      'Next Screen Button'
    );
    
    this.finishBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: /^Finish$/ }),
      'Finish Button'
    );
    
    // Success indicators
    this.successHeading = new Label(
      page,
      page.getByText('Create Person').or(page.getByText('Profile')),
      'Success Heading'
    );
  }

  async expectLoaded() {
    await this.section('Person Create Wizard - verify loaded', async () => {
      await this.firstNameInput.expectVisible();
      await this.lastNameInput.expectVisible();
      await this.emailInput.expectVisible();
    });
  }

  /**
   * Fill basic person information (Step 1)
   */
  async fillBasicInformation(data: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    await this.section('Fill basic person information', async () => {
      await this.firstNameInput.fill(data.firstName);
      await this.lastNameInput.fill(data.lastName);
      await this.emailInput.fill(data.email);
    });
  }

  /**
   * Click Next Screen button
   */
  async clickNextScreen() {
    await this.section('Click Next Screen', async () => {
      await this.nextScreenBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Upload document via file chooser (Step 2)
   */
  async uploadDocument(filePath: string) {
    await this.section(`Upload document: ${filePath}`, async () => {
      // Click New button
      await this.newDocumentBtn.click();
      
      // Wait for file chooser and upload file
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.additionalDocumentsBtn.click()
      ]);
      
      await fileChooser.setFiles(filePath);
      
      // Click OK button (on main page, not in iframe)
      await this.documentOkBtn.click();
    });
  }

  /**
   * Fill login information with password fields (Step 3)
   */
  async fillLoginInformation(data: {
    password: string;
    reenterPassword: string;
  }) {
    await this.section('Fill login information', async () => {
      await this.passwordInput.fill(data.password);
      await this.reenterPasswordInput.fill(data.reenterPassword);
    });
  }

  /**
   * Click Finish button
   */
  async clickFinish() {
    await this.section('Click Finish', async () => {
      await this.finishBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify password mismatch error is visible
   */
  async verifyPasswordMismatchError() {
    await this.section('Verify password mismatch error', async () => {
      await this.passwordMismatchError.expectVisible();
    });
  }

  /**
   * Verify profile creation success
   */
  async verifyProfileCreated() {
    await this.section('Verify profile created', async () => {
      await this.successHeading.expectVisible();
    });
  }
}
