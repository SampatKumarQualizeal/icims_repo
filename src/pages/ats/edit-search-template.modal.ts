// src/pages/ats/edit-search-template.modal.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Checkbox } from '@src/components/checkbox.component';

/**
 * EditSearchTemplateModal
 * Modal for editing existing search templates
 * Edit title, description, and sharing options
 */
export class EditSearchTemplateModal extends BasePage {
  readonly titleInput: Input;
  readonly descriptionInput: Input;
  readonly useTemplateCheckbox: Checkbox;
  readonly editDeleteCheckbox: Checkbox;
  readonly saveBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Modal on main page (not iframe)
    const modalLoc = page.locator('.ui-dialog');
    
    // STEP 2: Call super
    super(page, modalLoc, 'Edit Search Template Modal');
    
    // STEP 4: Instantiate components
    this.titleInput = new Input(
      page,
      modalLoc.getByLabel('Title'),
      'Title Input'
    );
    
    this.descriptionInput = new Input(
      page,
      modalLoc.getByLabel('Description'),
      'Description Input'
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
    await this.section('Edit Search Template Modal - verify loaded', async () => {
      await this.titleInput.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  async updateTemplate(data: {
    title?: string;
    description?: string;
    useTemplate?: boolean;
    editDelete?: boolean;
  }) {
    await this.section('Update search template', async () => {
      if (data.title !== undefined) {
        await this.titleInput.fill(data.title);
      }
      
      if (data.description !== undefined) {
        await this.descriptionInput.fill(data.description);
      }
      
      if (data.useTemplate !== undefined) {
        if (data.useTemplate) {
          await this.useTemplateCheckbox.check();
        } else {
          await this.useTemplateCheckbox.uncheck();
        }
      }
      
      if (data.editDelete !== undefined) {
        if (data.editDelete) {
          await this.editDeleteCheckbox.check();
        } else {
          await this.editDeleteCheckbox.uncheck();
        }
      }
      
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyTitle(expectedTitle: string) {
    await this.section(`Verify template title: ${expectedTitle}`, async () => {
      const titleValue = await this.titleInput.inputValue();
      if (titleValue !== expectedTitle) {
        throw new Error(`Expected title "${expectedTitle}", but got "${titleValue}"`);
      }
    });
  }
}
