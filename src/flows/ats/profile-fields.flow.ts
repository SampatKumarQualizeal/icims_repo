// src/flows/ats/profile-fields.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { PersonProfileFieldsPage } from '@src/pages/ats/person/person-profile-fields.page';
import { AddFieldModal } from '@src/pages/ats/add-field.modal';
import { DeleteFieldModal } from '@src/pages/ats/delete-field.modal';

/**
 * ProfileFieldsFlow
 * Orchestrates person profile field configuration workflows including:
 * - Creating field groups
 * - Adding custom fields with various types
 * - Configuring field visibility (read-only, hidden)
 * - Deleting fields and field groups
 */
export class ProfileFieldsFlow extends BaseFlow {
  readonly profileFieldsPage: PersonProfileFieldsPage;
  readonly addFieldModal: AddFieldModal;
  readonly deleteFieldModal: DeleteFieldModal;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.profileFieldsPage = new PersonProfileFieldsPage(page);
    this.addFieldModal = new AddFieldModal(page);
    this.deleteFieldModal = new DeleteFieldModal(page);
  }

  async navigateToContactTab() {
    await this.base.logger.section('Navigate to Contact tab', async () => {
      await this.profileFieldsPage.navigateTo();
      await this.profileFieldsPage.expectLoaded();
      await this.profileFieldsPage.selectContactTab();
    });
  }

  async createFieldGroup(fieldGroupName: string) {
    await this.base.logger.section(`Create field group: ${fieldGroupName}`, async () => {
      await this.profileFieldsPage.clickAddNewFieldGroup();
      await this.addFieldModal.expectLoaded();
      await this.addFieldModal.addFieldGroup(fieldGroupName);
      await this.profileFieldsPage.save();
      
      // Navigate back to Contact tab to verify
      await this.profileFieldsPage.selectContactTab();
      await this.profileFieldsPage.verifyFieldGroupVisible(fieldGroupName);
    });
  }

  async addFieldsToFieldGroup(testData: any) {
    await this.base.logger.section('Add custom fields to field group', async () => {
      const fields = testData.fields || [];
      
      for (const [index, field] of fields.entries()) {
        await this.profileFieldsPage.clickAddNewFieldToFieldGroup(testData.fieldGroupName);
        await this.addFieldModal.expectLoaded();
        await this.addFieldModal.addField(
          index,
          field.label,
          field.type,
          field.template
        );
      }
      
      await this.profileFieldsPage.closeAddFieldDialog();
      await this.profileFieldsPage.save();
      
      // Navigate back to Contact tab to verify all fields
      await this.profileFieldsPage.selectContactTab();
      for (const field of fields) {
        await this.profileFieldsPage.verifyFieldVisible(field.label);
      }
    });
  }

  async setFieldsReadOnly(fieldLabels: string[]) {
    await this.base.logger.section('Set fields to read-only mode', async () => {
      for (const fieldLabel of fieldLabels) {
        await this.profileFieldsPage.setFieldReadOnly(fieldLabel, true);
      }
      await this.profileFieldsPage.save();
    });
  }

  async setFieldsHidden(fieldLabels: string[]) {
    await this.base.logger.section('Set fields to hidden mode', async () => {
      for (const fieldLabel of fieldLabels) {
        // First uncheck read-only
        await this.profileFieldsPage.setFieldReadOnly(fieldLabel, false);
        // Then check hidden
        await this.profileFieldsPage.setFieldHidden(fieldLabel, true);
      }
      await this.profileFieldsPage.save();
    });
  }

  async deleteFields(fieldLabels: string[]) {
    await this.base.logger.section('Delete custom fields', async () => {
      for (const fieldLabel of fieldLabels) {
        // Re-query fields each time since DOM changes after deletion
        await this.profileFieldsPage.clickFieldActions(fieldLabel);
        await this.profileFieldsPage.clickDeleteField();
        await this.deleteFieldModal.expectLoaded();
        await this.deleteFieldModal.confirmDeletion();
      }
    });
  }

  async deleteFieldGroup(fieldGroupName: string) {
    await this.base.logger.section(`Delete field group: ${fieldGroupName}`, async () => {
      await this.profileFieldsPage.clickFieldActions(fieldGroupName);
      await this.profileFieldsPage.clickDeleteField();
      await this.deleteFieldModal.expectLoaded();
      await this.deleteFieldModal.confirmDeletion();
      
      await this.profileFieldsPage.save();
      
      // Navigate back to Contact tab to verify deletion
      await this.profileFieldsPage.selectContactTab();
      await this.profileFieldsPage.verifyFieldGroupNotVisible(fieldGroupName);
    });
  }

  async completeFullWorkflow(testData: any) {
    await this.base.logger.section('Complete full profile fields workflow', async () => {
      // Step 1: Navigate to Contact tab
      await this.navigateToContactTab();
      
      // Step 2: Create field group
      await this.createFieldGroup(testData.fieldGroupName);
      
      // Step 3: Add custom fields
      await this.addFieldsToFieldGroup(testData);
      
      // Step 4: Test visibility modes (if configured in testData)
      if (testData.testReadOnly) {
        const fieldLabels = testData.fields.map((f: any) => f.label);
        await this.profileFieldsPage.selectContactTab();
        await this.setFieldsReadOnly(fieldLabels);
      }
      
      if (testData.testHidden) {
        const fieldLabels = testData.fields.map((f: any) => f.label);
        await this.profileFieldsPage.selectContactTab();
        await this.setFieldsHidden(fieldLabels);
      }
      
      // Step 5: Cleanup - delete fields and field group
      if (testData.cleanup) {
        await this.profileFieldsPage.selectContactTab();
        const fieldLabels = testData.fields.map((f: any) => f.label);
        await this.deleteFields(fieldLabels);
        await this.deleteFieldGroup(testData.fieldGroupName);
      }
    });
  }
}
