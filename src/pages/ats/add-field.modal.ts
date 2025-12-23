// src/pages/ats/add-field.modal.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';

/**
 * AddFieldModal
 * Modal for adding new fields or field groups to person profile configuration
 */
export class AddFieldModal extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly addBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const configFrame = mainFrame.frameLocator('#configContentIFrame');
    
    // STEP 2: Call super
    super(page, configFrame.locator('body'), 'Add Field Modal');
    
    // STEP 3: Store frameLocator
    this.frameLocator = configFrame;
    
    // STEP 4: Instantiate components
    this.addBtn = new Button(
      page,
      configFrame.getByRole('button', { name: 'Add', exact: true }),
      'Add Button'
    );
    
    this.cancelBtn = new Button(
      page,
      configFrame.getByRole('button', { name: 'Cancel' }),
      'Cancel Button'
    );
  }

  async expectLoaded() {
    await this.section('Add Field Modal - verify loaded', async () => {
      await this.addBtn.expectVisible();
      await this.cancelBtn.expectVisible();
    });
  }

  async fillFieldLabel(index: number, label: string) {
    await this.section(`Fill field label: ${label}`, async () => {
      const fieldLabelInput = new Input(
        this.page,
        this.frameLocator!.locator(`#field_New${index}_NewFieldLabel`),
        'Field Label Input'
      );
      await fieldLabelInput.fill(label);
    });
  }

  async selectFieldType(index: number, fieldType: string) {
    await this.section(`Select field type: ${fieldType}`, async () => {
      const fieldTypeDropdown = new Dropdown(
        this.page,
        this.frameLocator!.locator(`#field_New${index}_NewFieldType`),
        'Field Type Dropdown'
      );
      await fieldTypeDropdown.select(fieldType);
    });
  }

  async selectFieldGroupType(index: number, groupType: string) {
    await this.section(`Select field group type: ${groupType}`, async () => {
      const fieldGroupTypeDropdown = new Dropdown(
        this.page,
        this.frameLocator!.locator(`#field_New${index}_NewFieldGroupType`),
        'Field Group Type Dropdown'
      );
      await fieldGroupTypeDropdown.select(groupType);
    });
  }

  async selectSearchTemplate(templateName: string) {
    await this.section(`Select search template: ${templateName}`, async () => {
      // Wait for template dropdown to appear
      await this.frameLocator!.getByRole('row', { name: 'Dropdown Options (Search Template)' })
        .getByLabel('Dropdown Options')
        .waitFor({ state: 'visible' });
      
      const templateDropdown = new Dropdown(
        this.page,
        this.frameLocator!.getByRole('row', { name: 'Dropdown Options (Search Template)' })
          .getByLabel('Dropdown Options'),
        'Search Template Dropdown'
      );
      await templateDropdown.select(templateName);
    });
  }

  async clickAdd() {
    await this.section('Click Add button', async () => {
      await this.addBtn.click();
      // Wait for field to be added
      await this.page.waitForTimeout(500);
    });
  }

  async addFieldGroup(label: string, groupType: string = 'Field Group') {
    await this.section(`Add field group: ${label}`, async () => {
      await this.fillFieldLabel(0, label);
      await this.selectFieldGroupType(0, groupType);
      await this.clickAdd();
    });
  }

  async addField(index: number, label: string, fieldType: string, templateName?: string) {
    await this.section(`Add field: ${label} (${fieldType})`, async () => {
      await this.fillFieldLabel(index, label);
      await this.selectFieldType(index, fieldType);
      
      // Special handling for Profile Link (Person) - requires template selection
      if (fieldType === 'Profile Link (Person)' && templateName) {
        await this.selectSearchTemplate(templateName);
      }
      
      await this.clickAdd();
    });
  }
}
