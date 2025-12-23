// src/pages/ats/submit-to-workflow.popup.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Div } from '@src/components/div.component';

/**
 * SubmitToWorkflowPopup
 * Popup for submitting candidates/persons to jobs
 * Can appear as new tab or modal dialog
 */
export class SubmitToWorkflowPopup extends BasePage {
  readonly filterByDropdown: Dropdown;
  readonly submitBtn: Button;
  readonly closeBtn: Button;
  readonly addItemBtn: Button;

  constructor(page: Page) {
    // STEP 1: Popup on main page (not iframe)
    const popupLoc = page.locator('body');
    
    // STEP 2: Call super
    super(page, popupLoc, 'Submit to Workflow Popup');
    
    // STEP 4: Instantiate components
    this.filterByDropdown = new Dropdown(
      page,
      page.getByRole('combobox', { name: /Filter by/i }),
      'Filter By Dropdown'
    );
    
    this.submitBtn = new Button(
      page,
      page.getByRole('button', { name: 'Submit' }),
      'Submit Button'
    );
    
    this.closeBtn = new Button(
      page,
      page.getByRole('button', { name: /Close/i }),
      'Close Button'
    );
    
    this.addItemBtn = new Button(
      page,
      page.getByRole('button', { name: /Add Item.*Selected/i }),
      'Add Item to Selected Button'
    );
  }

  async expectLoaded() {
    await this.section('Submit to Workflow Popup - verify loaded', async () => {
      await this.filterByDropdown.expectVisible();
      await this.submitBtn.expectVisible();
    });
  }

  async selectFilter(filterOption: string) {
    await this.section(`Select filter: ${filterOption}`, async () => {
      await this.filterByDropdown.click();
      
      const option = new Div(
        this.page,
        this.page.getByLabel(new RegExp(filterOption, 'i')),
        `Filter Option: ${filterOption}`
      );
      await option.locator.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async selectFirstJob() {
    await this.section('Select first available job', async () => {
      const availableListbox = new Div(
        this.page,
        this.page.getByRole('listbox', { name: /Available/i }),
        'Available Jobs Listbox'
      );
      
      const firstJob = new Button(
        this.page,
        availableListbox.locator.getByRole('option').first(),
        'First Job Option'
      );
      
      await firstJob.dblclick(); // Double-click to move to Selected list
    });
  }

  async getSelectedJobName(): Promise<string> {
    const selectedListbox = new Div(
      this.page,
      this.page.getByRole('listbox', { name: /Selected/i }),
      'Selected Jobs Listbox'
    );
    
    const firstSelected = selectedListbox.locator.getByRole('option').first();
    return await firstSelected.textContent() || '';
  }

  async addToSelected() {
    await this.section('Add job to selected list', async () => {
      await this.addItemBtn.click();
    });
  }

  async submit() {
    await this.section('Submit candidates to workflow', async () => {
      await this.submitBtn.click();
    });
  }

  async verifySuccess() {
    await this.section('Verify submission success', async () => {
      await this.page.locator('text=/submitted successfully/i').waitFor({ state: 'visible', timeout: 15000 });
    });
  }

  async close() {
    await this.section('Close Submit to Workflow popup', async () => {
      await this.closeBtn.click();
    });
  }
}
