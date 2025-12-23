// src/flows/ats/iform.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { IFormListPage } from '@src/pages/ats/iform/iform-list.page';
import { IFormCreateModal } from '@src/pages/ats/iform/iform-create.modal';
import { IFormSettingsModal } from '@src/pages/ats/iform/iform-settings.modal';
import { IFormViewsPage } from '@src/pages/ats/iform/iform-views.page';
import { IFormQuestionsPage } from '@src/pages/ats/iform/iform-questions.page';
import { IFormFieldDependenciesPage } from '@src/pages/ats/iform/iform-field-dependencies.page';
import { IFormMaintenancePage } from '@src/pages/ats/iform/iform-maintenance.page';
import { IFormPersonSearchPage } from '@src/pages/ats/iform/iform-person-search.page';
import { ProfileFieldSelectionPopup } from '@src/pages/ats/person/profile-field-selection.popup';
import { FieldDependencyCreatePopup } from '@src/pages/ats/field-dependency-create.popup';
import { PersonIFormsPage } from'@src/pages/ats/person/person-iforms.page';

/**
 * IFormFlow
 * Orchestrates iForm creation and configuration workflow
 */
export class IFormFlow extends BaseFlow {
  readonly listPage: IFormListPage;
  readonly personSearchPage: IFormPersonSearchPage;
  private creatiFormPage: IFormCreateModal;
  readonly viewsPage: IFormViewsPage;
  readonly questionsPage: IFormQuestionsPage;
  readonly dependenciesPage: IFormFieldDependenciesPage;
  readonly maintenancePage: IFormMaintenancePage;
  readonly personIFormsPage: PersonIFormsPage;
  

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.listPage = new IFormListPage(page);
    this.creatiFormPage = new IFormCreateModal(page);
    this.viewsPage = new IFormViewsPage(page);
    this.questionsPage = new IFormQuestionsPage(page);
    this.dependenciesPage = new IFormFieldDependenciesPage(page);
    this.maintenancePage = new IFormMaintenancePage(page);
    this.personSearchPage = new IFormPersonSearchPage(page);
    this.personIFormsPage = new PersonIFormsPage(page);
  }

  async navigateAndCreateIForm(testData: any) {
    await this.base.logger.section('Navigate and create iForm', async () => {
      await this.listPage.navigateTo();
      await this.listPage.expectLoaded();
      const popupPage = await this.listPage.clickCreateIForm();
      this.creatiFormPage = new  IFormCreateModal(popupPage);
      await this.creatiFormPage.expectOpen();
      // await this.listPage.clickCreateIForm();
      // await this.creatiFormPage.expectOpen();
      await this.creatiFormPage.createIForm(
        testData.iFormId || 'TestForm',
        testData.isPublic ?? true,
        testData.isEasy ?? true,
        testData.formType || 'person'
      );
      await this.viewsPage.expectLoaded();
    });
  }

  async configureViewsPage(testData: any) {
    await this.base.logger.section('Configure Views page', async () => {
      if (testData.viewsContent) {
        await this.viewsPage.fillEditorContent(testData.viewsContent);
        await this.viewsPage.save();
      }
      
      if (testData.grouploopName) {
        await this.viewsPage.insertGrouploop(testData.grouploopName);
      }
      
      if (testData.dependentGroupName) {
        await this.viewsPage.insertDependentFieldGroup(testData.dependentGroupName);
      }
      
      if (testData.grouploopName || testData.dependentGroupName) {
        await this.viewsPage.save();
      }
      
      await this.viewsPage.navigateToQuestions();
      await this.questionsPage.expectLoaded();
    });
  }

  async configureFieldTypes(testData: any) {
    await this.base.logger.section('Configure field types', async () => {
      const fieldTypes = testData.fieldTypes || [];
      
      for (const field of fieldTypes) {
        if (field.index !== undefined) {
          await this.questionsPage.setFieldTypeByIndex(field.index, field.type);
        } else if (field.name) {
          await this.questionsPage.setFieldType(field.name, field.type);
        }
      }
    });
  }

  async configureFieldSettings(testData: any) {
    await this.base.logger.section('Configure field settings', async () => {
      const fieldSettings = testData.fieldSettings || [];
      
      for (const field of fieldSettings) {
        if (field.dataField) {
          await this.questionsPage.setDataField(field.name, field.dataField);
        }
        
        if (field.required) {
          await this.questionsPage.markFieldRequired(field.name);
        }
        
        if (field.searchable) {
          await this.questionsPage.markFieldSearchable(field.name);
        }
        
        if (field.section) {
          await this.questionsPage.setSectionName(field.name, field.section);
        }
      }
      
      await this.questionsPage.save();
    });
  }

  async selectProfileField(testData: any, tabs: any) {
    await this.base.logger.section('Select profile field mapping', async () => {
      tabs.registerMain(this.page, 'Main Tab');
      
      await this.questionsPage.openProfileFieldSelection();
      
      const popupPage = await tabs.openPopupByClick(
        this.page,
        this.questionsPage.profileFieldSelectionLink,
        'Profile Field Selection'
      );
      
      const popup = new ProfileFieldSelectionPopup(popupPage);
      await popup.expectLoaded();
      await popup.selectProfileField(testData.profileFieldPath || 'Cand. Details Tab > Recruiter');
      
      await tabs.switchTo('Main Tab');
    });
  }

  async navigateToSections() {
    await this.base.logger.section('Navigate to Sections', async () => {
      await this.questionsPage.navigateToSections();
      await this.viewsPage.save(); // Save from sections page (shares same save link)
    });
  }

  async createFieldDependency(testData: any, tabs: any) {
    await this.base.logger.section('Create field dependency', async () => {
      await this.dependenciesPage.expectLoaded();
      
      tabs.registerMain(this.page, 'Main Tab');
      
      await this.dependenciesPage.openCreateDependency();
      
      const popupPage = await this.page.context().waitForEvent('page');
      tabs.registerTab(popupPage, 'Dependency Creation');
      await tabs.switchTo('Dependency Creation');
      
      const popup = new FieldDependencyCreatePopup(popupPage);
      await popup.expectLoaded();
      
      await popup.createDependency({
        name: testData.dependencyName || 'TestDependency',
        question: testData.dependencyQuestion || 'dropdown',
        operator: testData.dependencyOperator || 'Equal to',
        action: testData.dependencyAction || 'Show',
        target: testData.dependencyTarget || 'testdependentgroup'
      });
      
      await tabs.switchTo('Main Tab');
    });
  }

  async testDuplicateFieldHandling(testData: any) {
    await this.base.logger.section('Test duplicate field handling', async () => {
      await this.maintenancePage.navigateToViews();
      
      // Append content that creates duplicate
      await this.viewsPage.appendEditorContent(testData.duplicateContent || '\\nduplicate: {{textfield}}');
      await this.viewsPage.save();
    });
  }

  async verifyDuplicateWarning() {
    await this.base.logger.section('Verify duplicate field warning', async () => {
      const iframe = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const warningDiv = new (await import('@src/components/div.component')).Div(
        this.page,
        iframe.getByText('some of question names are duplicated'),
        'Duplicate Warning Message'
      );
      await warningDiv.expectVisible();
    });
  }

  async verifyFieldRenamed() {
    await this.base.logger.section('Verify field was renamed', async () => {
      const iframe = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const editorFrame = iframe.frameLocator('iframe[title*="Press ALT"]');
      const renamedFieldDiv = new (await import('@src/components/div.component')).Div(
        this.page,
        editorFrame.getByText('duplicate: {{textfield_1}}'),
        'Renamed Field'
      );
      await renamedFieldDiv.expectVisible();
    });
  }

  // ===== ATS-T29634: Date Validation Methods =====

  async navigateToIFormViews(iFormId: string) {
    await this.base.logger.section('Navigate to iForm Views tab', async () => {
      // Navigate via Create/Manage iForms and select the form
      await this.listPage.navigateTo();
      await this.listPage.expectLoaded();
      
      // Click on the iForm to edit it (opens in Views tab by default)
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      await mainFrame.getByRole('link', { name: iFormId }).click();
      await this.viewsPage.expectLoaded();
    });
  }

  async configureViews(testData: any) {
    await this.base.logger.section('Configure iForm Views', async () => {
      const viewsContent = testData.fields
        .map((field: any) => `${field.name}: {{${field.name}}}`)
        .join('\n\n');
      
      await this.viewsPage.fillEditorContent(viewsContent);
      await this.viewsPage.save();
    });
  }

  async navigateToIFormQuestions(iFormId: string) {
    await this.base.logger.section('Navigate to iForm Questions tab', async () => {
      // If already on an iForm page, just click Questions tab
      // Otherwise navigate to iForm first
      try {
        await this.viewsPage.navigateToQuestions();
      } catch {
        // Not on iForm page, navigate there first
        await this.navigateToIFormViews(iFormId);
        await this.viewsPage.navigateToQuestions();
      }
      await this.questionsPage.expectLoaded();
    });
  }

  async configureQuestionsWithPopup(testData: any, context: any) {
    await this.base.logger.section('Configure iForm Questions with validations', async () => {
      for (const field of testData.fields) {
        // Change field type
        await this.questionsPage.selectFieldType(field.name, field.type);
        
        // If validation is specified, open settings popup
        if (field.validation) {
          const [settingsPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.questionsPage.clickSettingsButton(field.name)
          ]);
          
          await settingsPage.waitForLoadState('networkidle');
          
          // Configure validation in the popup
          const settingsModal = new IFormSettingsModal(settingsPage);
          await settingsModal.expectLoaded();
          await settingsModal.selectValidation(field.validation);
          await settingsModal.save();
          
          // Close the settings tab
          await settingsPage.close();
        }
      }
      
      // Save the Questions configuration
      await this.questionsPage.save();
    });
  }

  async navigateToIFormMaintenance(iFormId: string) {
    await this.base.logger.section('Navigate to iForm Maintenance tab', async () => {
      // If already on an iForm page, just click Maintenance tab
      // Otherwise navigate to iForm first
      try {
        await this.viewsPage.navigateToMaintenance();
      } catch {
        try {
          await this.questionsPage.navigateToMaintenance();
        } catch {
          // Not on iForm page, navigate there first
          await this.navigateToIFormViews(iFormId);
          await this.viewsPage.navigateToMaintenance();
        }
      }
      await this.maintenancePage.expectLoaded();
    });
  }

  async enableIForm() {
    await this.base.logger.section('Enable iForm', async () => {
      await this.maintenancePage.verifyStatus('disabled');
      await this.maintenancePage.enableIForm();
      await this.maintenancePage.verifyStatus('enabled');
    });
  }
  async searchAndOpenPerson(personName: string) {
    await this.base.logger.section('Navigate and create iForm', async () => {
      await this.listPage.navigateToPearsonSearch();
      await this.personSearchPage.expectLoaded();
      await this.personSearchPage.enterKeywords(personName);
      await this.personSearchPage.clickSearch();
      await this.personSearchPage.clickLinkByName(personName);
      
    });
  }
  
  async navigateToPersonIForms(iFormId: string, fieldNames: string[]) {
      await this.base.logger.section('Navigate to Person iForms tab', async () => {
      await this.personIFormsPage.navigateToiForms();
      await this.personIFormsPage.selectIForm(iFormId);
      await this.personIFormsPage.verifyFieldsVisible(fieldNames);
    });
  }

  async testDateValidation(testData: any) {
    await this.base.logger.section('Test date field validations', async () => {
      await this.personIFormsPage.clickEdit();
      
      // Test each validation scenario
      for (const scenario of testData.validationScenarios) {
        await this.base.logger.info(`Testing: ${scenario.description}`);
        
        // Fill fields based on scenario
        for (const fieldData of scenario.fields) {
          await this.personIFormsPage.fillDateField(fieldData.name, fieldData.date);
        }
        
        await this.personIFormsPage.saveAndExit();
        
        // Verify expected result
        if (scenario.expectError) {
          await this.personIFormsPage.verifyErrorMessage(scenario.expectedErrorText);
          
          // Click Edit again to continue testing
          await this.personIFormsPage.clickEdit();
        } else {
          await this.personIFormsPage.verifyNoErrorMessage();
          await this.personIFormsPage.verifyEditButtonVisible();
        }
      }
    });
  }

  async deleteIForm(iFormId: string) {
    await this.base.logger.section(`Delete iForm: ${iFormId}`, async () => {
      await this.navigateToIFormMaintenance(iFormId);
      await this.maintenancePage.deleteIForm();
      await this.maintenancePage.verifyDeleted();
    });
  }
}
