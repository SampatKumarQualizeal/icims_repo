// src/pages/ats/save-search-template.modal.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Checkbox } from '@src/components/checkbox.component';

/**
 * SaveSearchTemplateModal
 * Modal for saving search templates with sharing options
 */
export class SaveSearchTemplateModal extends BasePage {
  readonly titleInput: Input;
  readonly descriptionInput: Input;
  readonly useTemplateCheckbox: Checkbox;
  readonly editDeleteCheckbox: Checkbox;
  readonly userGroupsBtn: Button;
  readonly saveBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Modal on main page (not iframe)
    const modalLoc = page.locator('.ui-dialog');
    
    // STEP 2: Call super
    super(page, modalLoc, 'Save Search Template Modal');
    
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
      modalLoc.getByLabel('Use this template'),
      'Use Template Checkbox'
    );
    
    this.editDeleteCheckbox = new Checkbox(
      page,
      modalLoc.getByLabel(/Edit.*Delete this template/),
      'Edit/Delete Template Checkbox'
    );
    
    this.userGroupsBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: 'User Groups' }),
      'User Groups Button'
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
    await this.section('Save Search Template Modal - verify loaded', async () => {
      await this.titleInput.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  async saveTemplate(data: {
    title: string;
    description?: string;
    useTemplate?: boolean;
    editDelete?: boolean;
    shareWithUserGroups?: boolean;
  }) {
    await this.section(`Save search template: ${data.title}`, async () => {
      await this.titleInput.fill(data.title);
      
      if (data.description) {
        await this.descriptionInput.fill(data.description);
      }
      
      if (data.useTemplate) {
        await this.useTemplateCheckbox.check();
      }
      
      if (data.editDelete) {
        await this.editDeleteCheckbox.check();
      }
      
      if (data.shareWithUserGroups) {
        await this.userGroupsBtn.click();
        // TODO: Select user groups
      }
      
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
