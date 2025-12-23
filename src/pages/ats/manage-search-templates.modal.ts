// src/pages/ats/manage-search-templates.modal.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * ManageSearchTemplatesModal
 * Modal for managing saved search templates
 * List, filter, search, edit, and delete templates
 */
export class ManageSearchTemplatesModal extends BasePage {
  readonly searchInput: Input;
  readonly searchBtn: Button;
  readonly clearBtn: Button;
  readonly newTemplateBtn: Button;
  readonly closeBtn: Button;

  constructor(page: Page) {
    // STEP 1: Modal on main page (not iframe)
    const modalLoc = page.locator('.ui-dialog');
    
    // STEP 2: Call super
    super(page, modalLoc, 'Manage Search Templates Modal');
    
    // STEP 4: Instantiate components
    this.searchInput = new Input(
      page,
      modalLoc.getByPlaceholder(/Search/),
      'Search Templates Input'
    );
    
    this.searchBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: 'Search' }),
      'Search Button'
    );
    
    this.clearBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: 'Clear' }),
      'Clear Button'
    );
    
    this.newTemplateBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: /New.*Template/ }),
      'New Template Button'
    );
    
    this.closeBtn = new Button(
      page,
      modalLoc.getByRole('button', { name: 'Close' }),
      'Close Button'
    );
  }

  async expectLoaded() {
    await this.section('Manage Search Templates Modal - verify loaded', async () => {
      await this.searchInput.expectVisible();
      await this.closeBtn.expectVisible();
    });
  }

  async searchTemplate(templateName: string) {
    await this.section(`Search for template: ${templateName}`, async () => {
      await this.searchInput.fill(templateName);
      await this.searchBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickEditTemplate(templateName: string) {
    await this.section(`Click Edit for template: ${templateName}`, async () => {
      const templateRow = new Div(
        this.page,
        this.root.locator('tr').filter({ hasText: templateName }),
        `Template Row: ${templateName}`
      );
      
      const editBtn = new Button(
        this.page,
        templateRow.locator.getByRole('button', { name: 'Edit' }),
        `Edit Button for ${templateName}`
      );
      
      await editBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickDeleteTemplate(templateName: string) {
    await this.section(`Click Delete for template: ${templateName}`, async () => {
      const templateRow = new Div(
        this.page,
        this.root.locator('tr').filter({ hasText: templateName }),
        `Template Row: ${templateName}`
      );
      
      const deleteBtn = new Button(
        this.page,
        templateRow.locator.getByRole('button', { name: 'Delete' }),
        `Delete Button for ${templateName}`
      );
      
      await deleteBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyTemplateExists(templateName: string) {
    await this.section(`Verify template exists: ${templateName}`, async () => {
      const templateRow = new Div(
        this.page,
        this.root.locator('tr').filter({ hasText: templateName }),
        `Template Row: ${templateName}`
      );
      
      await templateRow.expectVisible();
    });
  }

  async verifyTemplateNotExists(templateName: string) {
    await this.section(`Verify template not exists: ${templateName}`, async () => {
      const templateRow = new Div(
        this.page,
        this.root.locator('tr').filter({ hasText: templateName }),
        `Template Row: ${templateName}`
      );
      
      await templateRow.expectHidden();
    });
  }

  async close() {
    await this.section('Close Manage Templates Modal', async () => {
      await this.closeBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
