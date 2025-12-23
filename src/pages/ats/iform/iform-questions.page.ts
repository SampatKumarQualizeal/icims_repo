// src/pages/ats/iform-questions.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Input } from '@src/components/input.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * IFormQuestionsPage
 * Questions tab of iForm editor - configure field types, settings, and requirements
 */
export class IFormQuestionsPage extends BasePage {
  readonly saveLink: Link;
  readonly sectionsTab: Link;
  readonly profileFieldSelectionLink: Link;
  readonly viewsTab: Link;
  readonly maintenanceTab: Link;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes (3 levels for iForms)
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'iForm Questions Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    this.saveLink = new Link(
      page,
      mainFrame.getByText('Save', { exact: true }),
      'Save Link'
    );
    
    this.sectionsTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Sections' }),
      'Sections Tab'
    );
    
    this.profileFieldSelectionLink = new Link(
      page,
      mainFrame.getByRole('link', { name: '— Make a Selection —' }),
      'Profile Field Selection Link'
    );
    
    this.viewsTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Views' }),
      'Views Tab'
    );
    
    this.maintenanceTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Maintenance' }),
      'Maintenance Tab'
    );
  }

  async expectLoaded() {
    await this.section('iForm Questions - verify loaded', async () => {
      await this.saveLink.expectVisible();
    });
  }

  async setFieldType(fieldName: string, fieldType: string) {
    await this.section(`Set ${fieldName} to ${fieldType}`, async () => {
      // TODO: Verify selector pattern for field type dropdowns
      const fieldRow = this.frameLocator!.locator('tr', { 
        has: this.frameLocator!.locator(`td:has-text("${fieldName}")`) 
      });
      
      const dropdown = new Dropdown(
        this.page,
        fieldRow.locator('select').first(),
        `${fieldName} Type Dropdown`
      );
      
      await dropdown.select(fieldType);
    });
  }

  async setFieldTypeByIndex(index: number, fieldType: string) {
    await this.section(`Set field ${index} to ${fieldType}`, async () => {
      // TODO: Verify selector for field type dropdowns
      const fieldSelectors = this.frameLocator!.locator('select').filter({ 
        hasText: 'Text FieldNumber FieldDecimal' 
      });
      
      const dropdown = new Dropdown(
        this.page,
        fieldSelectors.nth(index),
        `Field ${index} Type Dropdown`
      );
      
      await dropdown.select(fieldType);
    });
  }

  async setDataField(fieldName: string, dataFieldOption: string) {
    await this.section(`Set ${fieldName} data field to ${dataFieldOption}`, async () => {
      const fieldRow = this.frameLocator!.locator('tr', { 
        has: this.frameLocator!.locator(`td:has-text("${fieldName}")`) 
      });
      
      // TODO: Verify nth index for data field dropdown (usually second select)
      const dropdown = new Dropdown(
        this.page,
        fieldRow.locator('select').nth(1),
        `${fieldName} Data Field Dropdown`
      );
      
      await dropdown.select(dataFieldOption);
    });
  }

  async markFieldRequired(fieldName: string) {
    await this.section(`Mark ${fieldName} as required`, async () => {
      const fieldRow = this.frameLocator!.locator('tr', { 
        has: this.frameLocator!.locator(`td:has-text("${fieldName}")`) 
      });
      
      const checkbox = new Checkbox(
        this.page,
        fieldRow.locator('input[type="checkbox"]').first(),
        `${fieldName} Required Checkbox`
      );
      
      await checkbox.check();
    });
  }

  async markFieldSearchable(fieldName: string) {
    await this.section(`Mark ${fieldName} as searchable`, async () => {
      const fieldRow = this.frameLocator!.locator('tr', { 
        has: this.frameLocator!.locator(`td:has-text("${fieldName}")`) 
      });
      
      const checkbox = new Checkbox(
        this.page,
        fieldRow.locator('input[type="checkbox"]').last(),
        `${fieldName} Searchable Checkbox`
      );
      
      await checkbox.check();
    });
  }

  async setSectionName(fieldName: string, sectionName: string) {
    await this.section(`Set ${fieldName} section to ${sectionName}`, async () => {
      const fieldRow = this.frameLocator!.locator('tr', { 
        has: this.frameLocator!.locator(`td:has-text("${fieldName}")`) 
      });
      
      const input = new Input(
        this.page,
        fieldRow.locator('input[type="text"]').first(),
        `${fieldName} Section Name Input`
      );
      
      await input.fill(sectionName);
    });
  }

  async openProfileFieldSelection() {
    await this.section('Open profile field selection popup', async () => {
      await this.profileFieldSelectionLink.click();
    });
  }

  async save() {
    await this.section('Save iForm questions', async () => {
      await this.saveLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async navigateToSections() {
    await this.section('Navigate to Sections tab', async () => {
      await this.sectionsTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async selectFieldType(fieldName: string, fieldType: string) {
    await this.section(`Select field type for ${fieldName}: ${fieldType}`, async () => {
      const fieldTypeDropdown = new Dropdown(
        this.page,
        this.frameLocator!.locator(`#${fieldName}_type`),
        `${fieldName} Type Dropdown`
      );
      
      await fieldTypeDropdown.select(fieldType);
      await this.page.waitForTimeout(500);
    });
  }

  async clickSettingsButton(fieldName: string) {
    await this.section(`Click Settings button for ${fieldName}`, async () => {
      const settingsBtn = new Button(
        this.page,
        this.frameLocator!.locator(`#${fieldName}_type_data_button`),
        `${fieldName} Settings Button`
      );
      
      await settingsBtn.click();
    });
  }

  async navigateToViews() {
    await this.section('Navigate to Views tab', async () => {
      await this.viewsTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async navigateToMaintenance() {
    await this.section('Navigate to Maintenance tab', async () => {
      await this.maintenanceTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
