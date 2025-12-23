// src/pages/ats/profile-field-selection.popup.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';

/**
 * ProfileFieldSelectionPopup
 * Popup window for selecting profile field mappings in iForms
 */
export class ProfileFieldSelectionPopup extends BasePage {
  readonly profileFieldDropdown: Dropdown;
  readonly okBtn: Button;

  constructor(page: Page) {
    // STEP 1: Popup is on new page (not iframe)
    
    // STEP 2: Call super
    super(page, page.locator('body'), 'Profile Field Selection Popup');
    
    // STEP 4: Instantiate components
    this.profileFieldDropdown = new Dropdown(
      page,
      page.locator('#profileFieldLink'),
      'Profile Field Dropdown'
    );
    
    this.okBtn = new Button(
      page,
      page.getByRole('button', { name: 'OK' }),
      'OK Button'
    );
  }

  async expectLoaded() {
    await this.section('Profile Field Selection Popup - verify loaded', async () => {
      await this.profileFieldDropdown.expectVisible();
      await this.okBtn.expectVisible();
    });
  }

  async selectProfileField(fieldPath: string) {
    await this.section(`Select profile field: ${fieldPath}`, async () => {
      await this.profileFieldDropdown.select(fieldPath);
      await this.okBtn.click();
    });
  }
}
