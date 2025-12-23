// src/pages/ats/portal/portal-candidate-profile.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Div } from '@src/components/div.component';

/**
 * PortalCandidateProfilePage
 * Step 2 of 3: Candidate Profile page with contact details and resume upload
 * Includes: Phone, Address, Resume upload, Source information
 * Renders inside: iframe[name="icims_content_iframe"]
 */
export class PortalCandidateProfilePage extends BasePage {
  private contentFrame: FrameLocator;
  
  readonly uploadLaterCheckbox: Checkbox;
  readonly phoneTypeDropdown: Dropdown;
  readonly phoneNumberInput: Input;
  readonly addressTypeDropdown: Dropdown;
  readonly addressInput: Input;
  readonly cityInput: Input;
  readonly zipInput: Input;
  readonly countryCombobox: Button;
  readonly stateCombobox: Button;
  readonly sourceDropdown: Dropdown;
  readonly submitProfileBtn: Button;
  readonly updateProfileBtn: Button;
  readonly myComputerUploadBtn: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Portal Candidate Profile Page');
    
    // STEP 3: Store frameLocator
    this.contentFrame = contentFrame;
    
    // STEP 4: Instantiate components
    this.uploadLaterCheckbox = new Checkbox(
      page,
      contentFrame.getByLabel('Upload Resume at a later time'),
      'Upload Resume Later Checkbox'
    );
    
    this.phoneTypeDropdown = new Dropdown(
      page,
      contentFrame.getByLabel('Type * required.'),
      'Phone Type Dropdown'
    );
    
    this.phoneNumberInput = new Input(
      page,
      contentFrame.getByLabel('Number * required.'),
      'Phone Number Input'
    );
    
    this.addressTypeDropdown = new Dropdown(
      page,
      contentFrame.getByLabel('Type * required.', { exact: true }),
      'Address Type Dropdown'
    );
    
    this.addressInput = new Input(
      page,
      contentFrame.getByLabel('Address * required.'),
      'Address Input'
    );
    
    this.cityInput = new Input(
      page,
      contentFrame.getByLabel('City * required.'),
      'City Input'
    );
    
    this.zipInput = new Input(
      page,
      contentFrame.getByLabel('Zip/Postal Code * required.'),
      'Zip Code Input'
    );
    
    this.countryCombobox = new Button(
      page,
      contentFrame.getByRole('combobox', { name: /Country/ }),
      'Country Combobox'
    );
    
    this.stateCombobox = new Button(
      page,
      contentFrame.getByRole('combobox', { name: /State\/Province/ }),
      'State/Province Combobox'
    );
    
    this.sourceDropdown = new Dropdown(
      page,
      contentFrame.locator('select[name="rcf3048"]'),
      'Source Dropdown'
    );
    
    this.submitProfileBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Submit Profile' }),
      'Submit Profile Button'
    );
    
    this.updateProfileBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Update Profile' }),
      'Update Profile Button'
    );
    
    this.myComputerUploadBtn = new Div(
      page,
      contentFrame.getByText('My Computer (Opens new window)My Computer'),
      'My Computer Upload Button'
    );
  }

  async skipResumeUpload() {
    await this.section('Skip initial resume upload', async () => {
      await this.uploadLaterCheckbox.check();
    });
  }

  async fillPhone(type: string, number: string) {
    await this.section('Fill phone information', async () => {
      await this.phoneTypeDropdown.select(type);
      await this.phoneNumberInput.fill(number);
    });
  }

  async fillAddress(testData: {
    type: string;
    address: string;
    city: string;
    zip: string;
  }) {
    await this.section('Fill address information', async () => {
      await this.addressTypeDropdown.select(testData.type);
      await this.addressInput.fill(testData.address);
      await this.cityInput.fill(testData.city);
      await this.zipInput.fill(testData.zip);
    });
  }

  async selectCountry(country: string) {
    await this.section(`Select country: ${country}`, async () => {
      await this.countryCombobox.click();
      await this.contentFrame.getByText(country, { exact: true }).click();
    });
  }

  async selectState(state: string, searchChar: string) {
    await this.section(`Select state: ${state}`, async () => {
      await this.stateCombobox.click();
      // Type character to filter dropdown
      await this.page.keyboard.type(searchChar);
      await this.page.waitForTimeout(500);
      await this.contentFrame.getByText(state, { exact: true }).click();
    });
  }

  async selectSource(source: string) {
    await this.section(`Select source: ${source}`, async () => {
      await this.sourceDropdown.select(source);
    });
  }

  async submitProfile() {
    await this.section('Submit Candidate Profile', async () => {
      await this.submitProfileBtn.click();
    });
  }

  async uploadResume(filePath: string) {
    await this.section('Upload resume from computer', async () => {
      const fileChooserPromise = this.page.waitForEvent('filechooser');
      await this.myComputerUploadBtn.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filePath);
    });
  }

  async updateProfile() {
    await this.section('Update profile', async () => {
      await this.updateProfileBtn.click();
    });
  }
}
