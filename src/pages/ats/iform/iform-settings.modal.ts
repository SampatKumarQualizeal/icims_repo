// src/pages/ats/iform-settings.modal.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';

/**
 * IFormSettingsModal
 * Settings popup for configuring iForm field validations
 * Opens in a NEW BROWSER TAB when clicking Settings button in Questions tab
 */
export class IFormSettingsModal extends BasePage {
  readonly validationDropdown: Dropdown;
  readonly saveBtn: Button;

  constructor(page: Page) {
    // // STEP 1: Resolve nested iframes (3 levels for iForms)
    // const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    // const targetFrame = mainFrame.frameLocator('iframe[name="target_frame_left"]');
    // const iFormsFrame = targetFrame.frameLocator('iframe[title="iForms Center"]');
    
    // // STEP 2: Call super
    // super(page, iFormsFrame.locator('body'), 'iForm Settings Modal');
    
    // // STEP 3: Store frameLocator
    // this.frameLocator = iFormsFrame;
    const modalRoot = page.locator('#inputdataform'); // popup root
    super(page, modalRoot, 'iForm Settings Modal');
    
    // STEP 4: Instantiate components
    this.validationDropdown = new Dropdown(
      page,
      modalRoot.locator('#validateDate'),
      'Field Validation Dropdown'
    );
    
    this.saveBtn = new Button(
      page,
      modalRoot.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
  }

  async expectLoaded() {
    await this.section('iForm Settings - verify loaded', async () => {
      await this.validationDropdown.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  async selectValidation(validation: string) {
    await this.section(`Select validation: ${validation}`, async () => {
      await this.validationDropdown.select(validation);
    });
  }

  async save() {
    await this.section('Save settings', async () => {
      await this.saveBtn.click();
    });
  }
}
