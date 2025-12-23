// src/pages/ats/person/person-add-simple.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

/**
 * PersonAddSimplePage
 * Simple person/candidate creation via Navigator > People > Add Person
 * Single-step form (no wizard) with basic fields
 * Renders inside: [data-testid="main-body-iframe"]
 */
export class PersonAddSimplePage extends BasePage {
  private mainFrame: FrameLocator;
  
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly emailInput: Input;
  readonly phoneInput: Input;
  readonly saveBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Add Simple Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.firstNameInput = new Input(
      page,
      page.getByLabel('First Name*'),
      'First Name Input'
    );
    
    this.lastNameInput = new Input(
      page,
      page.getByLabel('Last Name*'),
      'Last Name Input'
    );
    
    this.emailInput = new Input(
      page,
      page.getByLabel('Email'),
      'Email Input'
    );
    
    this.phoneInput = new Input(
      page,
      page.getByLabel('Phone'),
      'Phone Input'
    );
    
    this.saveBtn = new Button(
      page,
      page.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
  }

  async fillPersonInformation(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }) {
    await this.section('Fill person information', async () => {
      await this.firstNameInput.fill(data.firstName);
      await this.lastNameInput.fill(data.lastName);
      await this.emailInput.fill(data.email);
      
      if (data.phone) {
        await this.phoneInput.fill(data.phone);
      }
    });
  }

  async clickSave() {
    await this.section('Click Save button', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyPersonCreated(firstName: string, lastName: string) {
    await this.section(`Verify person created: ${firstName} ${lastName}`, async () => {
      const heading = this.page.getByRole('heading', { 
        name: `${firstName} ${lastName}` 
      });
      await heading.waitFor({ state: 'visible', timeout: 5000 });
    });
  }
}
