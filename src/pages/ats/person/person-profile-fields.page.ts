// src/pages/ats/person-profile-fields.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';
import { NavigatorMenuPage } from '@src/pages/common/navigation/nav-menu.page';
import { CreateMenuPage } from '@src/pages/common/navigation/create-menu.page';

/**
 * PersonProfileFieldsPage
 * System Configuration > Person > Person Profile Fields
 * Manages custom fields and field groups for person/contact profiles
 */
export class PersonProfileFieldsPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly navigatorMenu: NavigatorMenuPage;
  readonly createMenu: CreateMenuPage;
  readonly personBtn: Button;
  readonly contactTabLink: Link;
  readonly addNewFieldGroupLink: Link;
  readonly saveBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const configFrame = mainFrame.frameLocator('#configContentIFrame');
    
    // STEP 2: Call super
    super(page, configFrame.locator('body'), 'Person Profile Fields Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = configFrame;
    
    // STEP 4: Initialize navigation components
    this.navigatorMenu = new NavigatorMenuPage(page);
    this.createMenu = new CreateMenuPage(page);
    
    // STEP 5: Instantiate components
    this.personBtn = new Button(
      page,
      configFrame.locator("//li[contains(text(),'Company')]/following-sibling::li[contains(text(),'Person')]"),
      'Person Button'
    );
    
    this.contactTabLink = new Link(
      page,
      configFrame.locator('#tab_11690_Label'),
      'Contact Tab'
    );
    
    this.addNewFieldGroupLink = new Link(
      page,
      configFrame.locator('#field_ContactGeneral_NewFieldGroup_href'),
      'Add New Field Group Link'
    );
    
    this.saveBtn = new Button(
      page,
      configFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
  }

  async navigateTo() {
    await this.section('Navigate to System > Person > Person Profile Fields', async () => {
      // Open Navigator menu
      await this.navigatorMenu.navMenuButton.click();
      
      // Click Admin → System Configuration
      await this.createMenu.clickSystemConfiguration();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      
      // Click Person
      await this.personBtn.click();
      await this.page.waitForTimeout(1000); // Wait for submenu
      
      // Contact tab should now be visible
      await this.contactTabLink.waitFor('visible');
    });
  }

  async expectLoaded() {
    await this.section('Person Profile Fields Page - verify loaded', async () => {
      await this.contactTabLink.expectVisible();
    });
  }

  async selectContactTab() {
    await this.section('Select Contact tab', async () => {
      await this.contactTabLink.click();
      // Wait for tab content to load
      await this.frameLocator!.getByText('General Information').waitFor({ state: 'visible' });
    });
  }

  async clickAddNewFieldGroup() {
    await this.section('Click Add New Field Group', async () => {
      await this.addNewFieldGroupLink.click();
    });
  }

  async verifyFieldGroupVisible(fieldGroupName: string) {
    await this.section(`Verify field group visible: ${fieldGroupName}`, async () => {
      const fieldGroupDiv = new Div(
        this.page,
        this.frameLocator!.getByText(fieldGroupName),
        `Field Group: ${fieldGroupName}`
      );
      await fieldGroupDiv.expectVisible();
    });
  }

  async verifyFieldVisible(fieldLabel: string) {
    await this.section(`Verify field visible: ${fieldLabel}`, async () => {
      const fieldDiv = new Div(
        this.page,
        this.frameLocator!.getByText(fieldLabel),
        `Field: ${fieldLabel}`
      );
      await fieldDiv.expectVisible();
    });
  }

  async verifyFieldGroupNotVisible(fieldGroupName: string) {
    await this.section(`Verify field group not visible: ${fieldGroupName}`, async () => {
      const fieldGroupDiv = new Div(
        this.page,
        this.frameLocator!.getByText(fieldGroupName),
        `Field Group: ${fieldGroupName}`
      );
      await fieldGroupDiv.expectHidden();
    });
  }

  async clickFieldActions(fieldLabel: string) {
    await this.section(`Click Actions button for field: ${fieldLabel}`, async () => {
      // Find the row containing the field label, then click its Actions button
      const fieldRow = this.frameLocator!.getByRole('row', { name: new RegExp(fieldLabel) });
      const actionsBtn = new Button(
        this.page,
        fieldRow.locator('button', { hasText: 'Actions' }),
        `Actions Button for ${fieldLabel}`
      );
      await actionsBtn.click();
    });
  }

  async clickDeleteField() {
    await this.section('Click Delete Field from actions menu', async () => {
      const deleteFieldBtn = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: 'Delete Field' }),
        'Delete Field Button'
      );
      await deleteFieldBtn.click();
    });
  }

  async setFieldReadOnly(fieldLabel: string, readOnly: boolean) {
    await this.section(`Set field ${fieldLabel} read-only: ${readOnly}`, async () => {
      const fieldRow = this.frameLocator!.getByRole('row', { name: new RegExp(fieldLabel) });
      // Read-Only checkbox is in column 7 (index 7)
      const readOnlyCheckbox = fieldRow.locator('td').nth(7).locator('input[type="checkbox"]');
      
      const isChecked = await readOnlyCheckbox.isChecked();
      if (readOnly && !isChecked) {
        await readOnlyCheckbox.check();
      } else if (!readOnly && isChecked) {
        await readOnlyCheckbox.uncheck();
      }
    });
  }

  async setFieldHidden(fieldLabel: string, hidden: boolean) {
    await this.section(`Set field ${fieldLabel} hidden: ${hidden}`, async () => {
      const fieldRow = this.frameLocator!.getByRole('row', { name: new RegExp(fieldLabel) });
      // Hidden checkbox is in column 5 (index 5)
      const hiddenCheckbox = fieldRow.locator('td').nth(5).locator('input[type="checkbox"]');
      
      const isChecked = await hiddenCheckbox.isChecked();
      if (hidden && !isChecked) {
        await hiddenCheckbox.check();
      } else if (!hidden && isChecked) {
        await hiddenCheckbox.uncheck();
      }
    });
  }

  async clickAddNewFieldToFieldGroup(fieldGroupName: string) {
    await this.section(`Click Add New Field for field group: ${fieldGroupName}`, async () => {
      // Find the field group row and click its "Add New Field" button
      const addNewFieldBtn = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: 'Add New Field to Field Group' }).first(),
        'Add New Field to Field Group Button'
      );
      await addNewFieldBtn.click();
    });
  }

  async closeAddFieldDialog() {
    await this.section('Close Add Field dialog', async () => {
      const closeBtn = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: 'Close' }),
        'Close Button'
      );
      await closeBtn.click();
    });
  }

  async save() {
    await this.section('Save configuration', async () => {
      await this.saveBtn.click();
      // Wait for save to complete - page refreshes to tab selection view
      await this.contactTabLink.locator.waitFor({ state: 'visible' });
    });
  }
}
