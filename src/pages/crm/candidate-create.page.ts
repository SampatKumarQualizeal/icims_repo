// src/pages/crm/candidate-create.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * CandidateCreatePage
 * CRM candidate creation form (manual entry)
 */
export class CandidateCreatePage extends BasePage {
  readonly manualEntryBtn: Button;
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly emailInput: Input;
  readonly mobilePhoneInput: Input;
  readonly homePhoneInput: Input;
  readonly workPhoneInput: Input;
  readonly referralSourceInput: Input;
  readonly submitBtn: Button;
  readonly pageHeading: Div;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Candidate Create Page');

    this.manualEntryBtn = new Button(
      page,
      page.getByRole('button', { name: 'Manual entry' }),
      'Manual Entry Button'
    );

    this.firstNameInput = new Input(
      page,
      page.getByRole('textbox', { name: 'First name*' }),
      'First Name Input'
    );

    this.lastNameInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Last name*' }),
      'Last Name Input'
    );

    this.emailInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Email*' }),
      'Email Input'
    );

    this.mobilePhoneInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Mobile phone' }),
      'Mobile Phone Input'
    );

    this.homePhoneInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Home phone' }),
      'Home Phone Input'
    );

    this.workPhoneInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Work phone' }),
      'Work Phone Input'
    );

    this.referralSourceInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Referral source' }),
      'Referral Source Input'
    );

    this.submitBtn = new Button(
      page,
      page.getByRole('button', { name: 'Submit' }),
      'Submit Button'
    );

    this.pageHeading = new Div(
      page,
      page.getByRole('heading', { name: 'Create candidate', level: 1 }),
      'Page Heading'
    );
  }

  async expectLoaded() {
    await this.section('Expect CRM Candidate Create form loaded', async () => {
      await this.pageHeading.expectVisible();
      await this.firstNameInput.expectVisible();
    });
  }

  async clickManualEntry() {
    await this.section('Click Manual Entry', async () => {
      await this.manualEntryBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.expectLoaded();
    });
  }

  async fillCandidateForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone?: string;
    homePhone?: string;
    workPhone?: string;
    referralSource?: string;
  }) {
    await this.section('Fill candidate form', async () => {
      await this.firstNameInput.fill(data.firstName);
      await this.lastNameInput.fill(data.lastName);
      await this.emailInput.fill(data.email);

      if (data.mobilePhone) {
        await this.mobilePhoneInput.fill(data.mobilePhone);
      }

      if (data.homePhone) {
        await this.homePhoneInput.fill(data.homePhone);
      }

      if (data.workPhone) {
        await this.workPhoneInput.fill(data.workPhone);
      }

      if (data.referralSource) {
        await this.referralSourceInput.fill(data.referralSource);
      }
    });
  }

  async submitForm() {
    await this.section('Submit candidate form', async () => {
      await this.submitBtn.click();
      await this.page.waitForURL('**/candidates/**', { timeout: 10000 });
      await this.page.waitForLoadState('networkidle');
    });
  }
}
