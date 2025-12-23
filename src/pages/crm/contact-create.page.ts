// src/pages/crm/contact-create.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';
import { Dropdown } from '@src/components/dropdown.component';

/**
 * ContactCreatePage
 * CRM contact creation form
 */
export class ContactCreatePage extends BasePage {
  readonly firstNameInput: Input;
  readonly lastNameInput: Input;
  readonly phoneInput: Input;
  readonly companyInput: Input;
  readonly emailInput: Input;
  readonly categoryDropdown: Dropdown;
  readonly saveBtn: Button;
  readonly successMessage: Div;
  readonly pageHeading: Div;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Contact Create Page');

    // Locators based on provided test case details and locator metadata
    const firstNameInputLoc: Locator = page.locator("input[name='first_name']");
    const lastNameInputLoc: Locator = page.locator("input[name='last_name']");
    // Phone and Company fields: placeholder locators, update as needed
    const phoneInputLoc: Locator = page.locator("input[name='phone']"); // TODO: Replace with actual locator
    const companyInputLoc: Locator = page.locator("input[name='company']"); // TODO: Replace with actual locator
    const emailInputLoc: Locator = page.locator("input[placeholder='Email address']");
    const categoryDropdownLoc: Locator = page.locator(".ui.selection.dropdown");
    const saveBtnLoc: Locator = page.locator("//button[contains(., 'Save')]");
    // Success message: generic div containing success text
    const successMessageLoc: Locator = page.locator("div:has-text('contact successfully created')"); // TODO: Replace with actual message text
    const pageHeadingLoc: Locator = page.locator('h1, h2, h3').filter({ hasText: 'Create Contact' }); // TODO: Replace with actual heading

    this.firstNameInput = new Input(page, firstNameInputLoc, 'First Name Input');
    this.lastNameInput = new Input(page, lastNameInputLoc, 'Last Name Input');
    this.phoneInput = new Input(page, phoneInputLoc, 'Phone Number Input');
    this.companyInput = new Input(page, companyInputLoc, 'Company Input');
    this.emailInput = new Input(page, emailInputLoc, 'Email Address Input');
    this.categoryDropdown = new Dropdown(page, categoryDropdownLoc, 'Category Dropdown');
    this.saveBtn = new Button(page, saveBtnLoc, 'Save Button');
    this.successMessage = new Div(page, successMessageLoc, 'Contact Success Message');
    this.pageHeading = new Div(page, pageHeadingLoc, 'Page Heading');
  }

  async expectLoaded() {
    await this.section('Expect CRM Contact Create form loaded', async () => {
      await this.firstNameInput.expectVisible();
      await this.lastNameInput.expectVisible();
      await this.emailInput.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  /**
   * Fills all required fields and submits the contact creation form.
   * Waits for success message after submission.
   */
  async createContact(data: {
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    email: string;
    category?: string;
  }) {
    await this.section('Fill and submit contact creation form', async () => {
      await this.firstNameInput.fill(data.firstName);
      await this.lastNameInput.fill(data.lastName);
      await this.phoneInput.fill(data.phone);
      await this.companyInput.fill(data.company);
      await this.emailInput.fill(data.email);
      if (data.category) {
        await this.categoryDropdown.selectOptionByVisibleText(data.category);
      }
      await this.saveBtn.click();
      // Wait for either navigation or success message
      await this.successMessage.expectVisible();
    });
  }
}
