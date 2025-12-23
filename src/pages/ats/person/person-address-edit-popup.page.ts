// src/pages/ats/person/person-address-edit-popup.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Checkbox } from '@src/components/checkbox.component';

/**
 * PersonAddressEditPopupPage
 * Handles address editing in popup window
 * Opens when editing address from Contact tab
 * Includes validation warning handling
 */
export class PersonAddressEditPopupPage extends BasePage {
  readonly cityInput: Input;
  readonly okBtn: Button;
  readonly validationYesCheckbox: Checkbox;

  constructor(page: Page) {
    // STEP 1: No iframe - popup is a separate page
    
    // STEP 2: Call super
    super(page, page.locator('body'), 'Address Edit Popup');
    
    // STEP 3: No frameLocator
    
    // STEP 4: Instantiate components
    this.cityInput = new Input(
      page,
      page.getByLabel('City'),
      'City Input'
    );
    
    this.okBtn = new Button(
      page,
      page.getByRole('button', { name: 'OK' }),
      'OK Button'
    );
    
    this.validationYesCheckbox = new Checkbox(
      page,
      page.getByLabel('Yes'),
      'Validation Yes Checkbox'
    );
  }

  async updateCity(city: string) {
    await this.section(`Update city: ${city}`, async () => {
      await this.cityInput.clear();
      await this.cityInput.fill(city);
    });
  }

  async clickOk() {
    await this.section('Click OK button', async () => {
      await this.okBtn.click();
    });
  }

  async handleValidationWarning() {
    await this.section('Handle address validation warning', async () => {
      try {
        await this.validationYesCheckbox.check();
        await this.okBtn.click();
      } catch (error) {
        // No validation warning appeared, continue
      }
    });
  }
}
