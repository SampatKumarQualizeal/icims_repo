// src/pages/ats/save-output-template.modal.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Checkbox } from '@src/components/checkbox.component';

/**
 * SaveOutputTemplateModal
 * Modal for saving output/display templates
 * Reuses same modal structure as SaveSearchTemplateModal
 */
export class SaveOutputTemplateModal extends BasePage {
  readonly titleInput: Input;
  readonly useTemplateCheckbox: Checkbox;
  readonly editDeleteCheckbox: Checkbox;
  readonly saveBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Modal on main page (not iframe)
    const modalLoc = page.locator('.ui-dialog');
    
    // STEP 2: Call super
    super(page, modalLoc, 'Save Output Template Modal');
    
    // STEP 4: Instantiate components
    this.titleInput = new Input(
      page,
      modalLoc.getByLabel('Title'),
      'Title Input'
    );
    
    this.useTemplateCheckbox = new Checkbox(
      page,
      modalLoc.getByLabel(/Use this template/),
      'Use Template Checkbox'
    );
    
    this.editDeleteCheckbox = new Checkbox(
      page,
      modalLoc.getByLabel(/Edit.*Delete this template/),
      'Edit/Delete Template Checkbox'
    );
    
    this.saveBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.cancelBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: 'Cancel' }),
      'Cancel Button'
    );
  }

  async expectLoaded() {
    await this.section('Save Output Template Modal - verify loaded', async () => {
      await this.titleInput.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  async saveTemplate(data: {
    title: string;
    useTemplate?: boolean;
    editDelete?: boolean;
  }) {
    await this.section(`Save output template: ${data.title}`, async () => {
      await this.titleInput.fill(data.title);
      
      if (data.useTemplate) {
        await this.useTemplateCheckbox.check();
      }
      
      if (data.editDelete) {
        await this.editDeleteCheckbox.check();
      }
      
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
