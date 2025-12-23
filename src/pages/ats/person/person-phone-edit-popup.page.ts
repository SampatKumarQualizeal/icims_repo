// src/pages/ats/person/person-phone-edit-popup.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

/**
 * PersonPhoneEditPopupPage
 * Handles phone number editing in popup window
 * Opens when editing phone from Contact tab
 */
export class PersonPhoneEditPopupPage extends BasePage {
  readonly numberInput: Input;
  readonly okBtn: Button;

  constructor(page: Page) {
    // STEP 1: No iframe - popup is a separate page
    
    // STEP 2: Call super
    super(page, page.locator('body'), 'Phone Edit Popup');
    
    // STEP 3: No frameLocator
    
    // STEP 4: Instantiate components
    this.numberInput = new Input(
      page,
      page.getByLabel('Number*'),
      'Number Input'
    );
    
    this.okBtn = new Button(
      page,
      page.getByRole('button', { name: 'OK' }),
      'OK Button'
    );
  }

  async updateNumber(phoneNumber: string) {
    await this.section(`Update phone number: ${phoneNumber}`, async () => {
      await this.numberInput.clear();
      await this.numberInput.fill(phoneNumber);
    });
  }

  async clickOk() {
    await this.section('Click OK button', async () => {
      await this.okBtn.click();
    });
  }
}
