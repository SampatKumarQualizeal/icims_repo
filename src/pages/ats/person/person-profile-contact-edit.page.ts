// src/pages/ats/person/person-profile-contact-edit.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileContactEditPage
 * Handles editing Contact tab in person profile
 * Includes: Name, Email, Phone (popup), Address (popup), Tags
 * Structure: [data-testid="main-body-iframe"] → iframe[name="target_frame_left"]
 */
export class PersonProfileContactEditPage extends BasePage {
  private mainFrame: FrameLocator;
  private contactFrame: FrameLocator;
  
  readonly contactTab: Button;
  readonly editBtn: Button;
  readonly saveBtn: Button;
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly emailInput: Input;
  readonly phoneEditBtn: Button;
  readonly addressEditBtn: Button;
  readonly tagInput: Input;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const contactFrame = mainFrame.locator('iframe[name="target_frame_left"]').contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Contact Edit');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.contactFrame = contactFrame;
    
    // STEP 4: Instantiate components
    this.contactTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Contact' }),
      'Contact Tab'
    );
    
    this.editBtn = new Button(
      page,
      contactFrame.getByRole('button', { name: 'Edit', exact: true }),
      'Edit Button'
    );
    
    this.saveBtn = new Button(
      page,
      contactFrame.getByRole('button', { name: 'Save', exact: true }),
      'Save Button'
    );
    
    this.firstNameInput = new Input(
      page,
      contactFrame.getByLabel('First Name*'),
      'First Name Input'
    );
    
    this.lastNameInput = new Input(
      page,
      contactFrame.getByLabel('Last Name*'),
      'Last Name Input'
    );
    
    this.emailInput = new Input(
      page,
      contactFrame.getByLabel('Email'),
      'Email Input'
    );
    
    this.phoneEditBtn = new Button(
      page,
      contactFrame.locator('[id="PersonProfileFields.Phones"]').getByRole('button', { name: 'Edit' }),
      'Phone Edit Button'
    );
    
    this.addressEditBtn = new Button(
      page,
      contactFrame.locator('[id="PersonProfileFields.Addresses"]').getByRole('button', { name: 'Edit' }),
      'Address Edit Button'
    );
    
    this.tagInput = new Input(
      page,
      contactFrame.getByPlaceholder('Type to add new tag').first(),
      'Tag Input'
    );
  }

  async clickContactTab() {
    await this.section('Click Contact tab', async () => {
      await this.contactTab.click();
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
    });
  }

  async updateFirstName(firstName: string) {
    await this.section(`Update first name: ${firstName}`, async () => {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(firstName);
    });
  }

  async updateLastName(lastName: string) {
    await this.section(`Update last name: ${lastName}`, async () => {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(lastName);
    });
  }

  async updateEmail(email: string) {
    await this.section(`Update email: ${email}`, async () => {
      await this.emailInput.clear();
      await this.emailInput.fill(email);
    });
  }

  async clickPhoneEdit() {
    await this.section('Click phone edit button', async () => {
      await this.phoneEditBtn.click();
    });
  }

  async clickAddressEdit() {
    await this.section('Click address edit button', async () => {
      await this.addressEditBtn.click();
    });
  }

  async addTag(tagName: string) {
    await this.section(`Add tag: ${tagName}`, async () => {
      await this.tagInput.fill(tagName);
      await this.page.keyboard.press('Enter');
    });
  }

  async clickSave() {
    await this.section('Click Save button', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
