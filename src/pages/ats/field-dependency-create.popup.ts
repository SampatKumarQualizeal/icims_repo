// src/pages/ats/field-dependency-create.popup.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Input } from '@src/components/input.component';

/**
 * FieldDependencyCreatePopup
 * Popup window for creating field dependencies in iForms
 */
export class FieldDependencyCreatePopup extends BasePage {
  readonly nameInput: Input;
  readonly questionDropdown: Dropdown;
  readonly operatorDropdown: Dropdown;
  readonly actionDropdown: Dropdown;
  readonly targetDropdown: Dropdown;
  readonly createBtn: Button;

  constructor(page: Page) {
    // STEP 1: Popup is on new page (not iframe)
    
    // STEP 2: Call super
    super(page, page.locator('body'), 'Field Dependency Create Popup');
    
    // STEP 4: Instantiate components
    this.nameInput = new Input(
      page,
      page.locator('#name'),
      'Dependency Name Input'
    );
    
    // TODO: Verify selector for question dropdown
    this.questionDropdown = new Dropdown(
      page,
      page.getByRole('row', { name: 'Question*' }).getByLabel('-Select-'),
      'Question Dropdown'
    );
    
    this.operatorDropdown = new Dropdown(
      page,
      page.locator('#operator'),
      'Operator Dropdown'
    );
    
    this.actionDropdown = new Dropdown(
      page,
      page.locator('#action'),
      'Action Dropdown'
    );
    
    // TODO: Verify selector for target combobox
    this.targetDropdown = new Dropdown(
      page,
      page.getByRole('combobox', { name: '— Make a Selection —' }),
      'Target Dropdown'
    );
    
    this.createBtn = new Button(
      page,
      page.getByRole('button', { name: 'Create' }),
      'Create Button'
    );
  }

  async expectLoaded() {
    await this.section('Field Dependency Create Popup - verify loaded', async () => {
      await this.nameInput.expectVisible();
      await this.createBtn.expectVisible();
    });
  }

  async createDependency(data: {
    name: string;
    question: string;
    operator: string;
    action: string;
    target: string;
  }) {
    await this.section(`Create dependency: ${data.name}`, async () => {
      await this.nameInput.fill(data.name);
      
      await this.questionDropdown.click();
      await this.page.getByRole('option', { name: data.question }).click();
      
      await this.operatorDropdown.select(data.operator);
      await this.actionDropdown.select(data.action);
      
      await this.targetDropdown.click();
      await this.page.getByRole('option', { name: data.target }).click();
      
      await this.createBtn.click();
    });
  }
}
