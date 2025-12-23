// src/pages/connect/connect-profile.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectProfilePage
 * Connect Portal profile information page
 */
export class ConnectProfilePage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly heading: Div;
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly emailInput: Input;
  readonly phoneInput: Input;
  readonly zipInput: Input;
  readonly jobTitleInput: Input;
  readonly submitBtn: Button;
  readonly backLink: Link;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Profile Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;
    
    // STEP 4: Instantiate components
    this.heading = new Div(
      page,
      contentFrame.getByRole('listitem').filter({ hasText: 'Profile Profile' }),
      'Profile Heading'
    );
    
    this.firstNameInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'First Name' }),
      'First Name Input'
    );
    
    this.lastNameInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'Last Name' }),
      'Last Name Input'
    );
    
    this.emailInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'Email' }),
      'Email Input'
    );
    
    this.phoneInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'Phone Number' }),
      'Phone Input'
    );
    
    this.zipInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'Zip/Postal Code' }),
      'Zip/Postal Code Input'
    );
    
    this.jobTitleInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'Current Job Title' }),
      'Job Title Input'
    );
    
    this.submitBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Submit Profile' }),
      'Submit Button'
    );
    
    this.backLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Back', exact: true }),
      'Back Link'
    );
  }

  async expectLoaded() {
    await this.section('Connect Profile Page - verify loaded', async () => {
      await this.heading.expectVisible();
      await this.firstNameInput.expectVisible();
      await this.lastNameInput.expectVisible();
      await this.emailInput.expectVisible();
      await this.submitBtn.expectVisible();
    });
  }

  async verifyEmailPrefilled(expectedEmail: string) {
    await this.section(`Verify email pre-filled: ${expectedEmail}`, async () => {
      await this.emailInput.expectVisible();
      const value = await this.emailInput.locator.inputValue();
      if (value !== expectedEmail) {
        throw new Error(`Expected email "${expectedEmail}", but found "${value}"`);
      }
    });
  }

  async fillProfile(data: {
    firstName: string;
    lastName: string;
    phone?: string;
    zip: string;
    jobTitle?: string;
  }) {
    await this.section('Fill profile information', async () => {
      await this.firstNameInput.fill(data.firstName);
      await this.lastNameInput.fill(data.lastName);
      
      if (data.phone) {
        await this.phoneInput.fill(data.phone);
      }
      
      await this.zipInput.fill(data.zip);
      
      if (data.jobTitle) {
        await this.jobTitleInput.fill(data.jobTitle);
      }
    });
  }

  async clickSubmit() {
    await this.section('Submit profile', async () => {
      await this.submitBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
