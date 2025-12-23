// src/flows/ats/person-search.flow.ts
import { Page } from '@playwright/test';
import { PersonSearchPage } from '@src/pages/ats/person/person-search.page';
import { SaveSearchTemplateModal } from '@src/pages/ats/save-search-template.modal';
import { SaveOutputTemplateModal } from '@src/pages/ats/save-output-template.modal';
import { ManageSearchTemplatesModal } from '@src/pages/ats/manage-search-templates.modal';
import { EditSearchTemplateModal } from '@src/pages/ats/edit-search-template.modal';

/**
 * PersonSearchFlow
 * Orchestrates person/candidate search workflows including:
 * - Configure search criteria (filters, columns, groups, sorts)
 * - Save search and output templates
 * - Manage templates (edit, delete)
 */
export class PersonSearchFlow {
  private page: Page;
  private personSearchPage: PersonSearchPage;
  private saveSearchTemplateModal: SaveSearchTemplateModal;
  private saveOutputTemplateModal: SaveOutputTemplateModal;
  private manageSearchTemplatesModal: ManageSearchTemplatesModal;
  private editSearchTemplateModal: EditSearchTemplateModal;

  constructor(page: Page) {
    this.page = page;
    this.personSearchPage = new PersonSearchPage(page);
    this.saveSearchTemplateModal = new SaveSearchTemplateModal(page);
    this.saveOutputTemplateModal = new SaveOutputTemplateModal(page);
    this.manageSearchTemplatesModal = new ManageSearchTemplatesModal(page);
    this.editSearchTemplateModal = new EditSearchTemplateModal(page);
  }

  async navigateToPersonSearch() {
    await this.personSearchPage.navigateTo();
  }

  async configureSearch(testData: {
    filters?: Array<{ name: string; options: string[]; treeItems?: string[] }>;
    columns?: string[];
    groupBy?: string[];
    sortBy?: Array<{ column: string; direction: 'ascending' | 'descending' }>;
  }) {
    const filters = testData.filters || [];
    const columns = testData.columns || [];
    const groupBy = testData.groupBy || [];
    const sortBy = testData.sortBy || [];

    // Add filters
    for (const filter of filters) {
      await this.personSearchPage.addFilter(filter.name, filter.treeItems || [filter.name]);
      await this.personSearchPage.selectFilterOptions(filter.options);
    }

    // Add columns
    for (const column of columns) {
      await this.personSearchPage.addColumn(column, [column]);
    }

    // Add group by
    for (const group of groupBy) {
      await this.personSearchPage.addGroupBy(group, [group]);
    }

    // Add sort by
    for (const sort of sortBy) {
      await this.personSearchPage.addSortBy(sort.column, [sort.column]);
      const order = sort.direction === 'ascending' ? 'Ascending (A to Z)' : 'Descending (Z to A)';
      await this.personSearchPage.setSortOrder(sort.column, order);
    }
  }

  async runSearch() {
    await this.personSearchPage.runSearch();
  }

  async saveSearchTemplate(testData: {
    title: string;
    description?: string;
    useTemplate?: boolean;
    editDelete?: boolean;
  }) {
    await this.personSearchPage.openSaveSearchTemplate();
    await this.saveSearchTemplateModal.expectLoaded();
    await this.saveSearchTemplateModal.saveTemplate({
      title: testData.title,
      description: testData.description,
      useTemplate: testData.useTemplate,
      editDelete: testData.editDelete,
    });
  }

  async saveOutputTemplate(testData: {
    title: string;
    useTemplate?: boolean;
    editDelete?: boolean;
  }) {
    await this.personSearchPage.openSaveOutputTemplate();
    await this.saveOutputTemplateModal.expectLoaded();
    await this.saveOutputTemplateModal.saveTemplate({
      title: testData.title,
      useTemplate: testData.useTemplate,
      editDelete: testData.editDelete,
    });
  }

  async verifySearchTemplateInDropdown(templateName: string) {
    await this.personSearchPage.verifyTemplateInDropdown(templateName);
  }

  async verifyOutputTemplateInDropdown(templateName: string) {
    await this.personSearchPage.verifyTemplateInDropdown(templateName);
  }

  async manageSearchTemplates() {
    await this.personSearchPage.openManageSearchTemplates();
    await this.manageSearchTemplatesModal.expectLoaded();
  }

  async searchTemplateInManageModal(templateName: string) {
    await this.manageSearchTemplatesModal.searchTemplate(templateName);
  }

  async verifyTemplateExists(templateName: string) {
    await this.manageSearchTemplatesModal.verifyTemplateExists(templateName);
  }

  async editSearchTemplate(templateName: string, newData: {
    title?: string;
    description?: string;
    useTemplate?: boolean;
    editDelete?: boolean;
  }) {
    await this.manageSearchTemplatesModal.clickEditTemplate(templateName);
    await this.editSearchTemplateModal.expectLoaded();
    await this.editSearchTemplateModal.updateTemplate(newData);
  }

  async verifyTemplateTitle(expectedTitle: string) {
    await this.editSearchTemplateModal.verifyTitle(expectedTitle);
  }

  async deleteSearchTemplate(templateName: string) {
    await this.manageSearchTemplatesModal.clickDeleteTemplate(templateName);
  }

  async verifyTemplateDeleted(templateName: string) {
    await this.manageSearchTemplatesModal.verifyTemplateNotExists(templateName);
  }

  async closeManageTemplatesModal() {
    await this.manageSearchTemplatesModal.close();
  }
}
