// src/flows/ats/job-search.flow.ts
import { Page } from '@playwright/test';
import { JobSearchPage } from '@src/pages/ats/search/job-search.page';
import { PersonSearchPage } from '@src/pages/ats/person/person-search.page';
import { SubmitToWorkflowPopup } from '@src/pages/ats/workflow/submit-to-workflow.popup';
import { SaveSearchTemplateModal } from '@src/pages/ats/save-search-template.modal';
import { ManageDashboardsPage } from '@src/pages/ats/dashboard/manage-dashboards.page';
import { DashboardFactoidModal } from '@src/pages/ats/dashboard/dashboard-factoid.modal';

/**
 * JobSearchFlow
 * Orchestrates job search workflows including:
 * - Submit candidates to workflow
 * - Configure job search criteria (filters, columns)
 * - Save job search templates
 * - Create dashboard factoids from search templates
 */
export class JobSearchFlow {
  private page: Page;
  private personSearchPage: PersonSearchPage;
  private jobSearchPage: JobSearchPage;
  private submitToWorkflowPopup: SubmitToWorkflowPopup;
  private saveSearchTemplateModal: SaveSearchTemplateModal;
  private manageDashboardsPage: ManageDashboardsPage;
  private dashboardFactoidModal: DashboardFactoidModal;

  constructor(page: Page) {
    this.page = page;
    this.personSearchPage = new PersonSearchPage(page);
    this.jobSearchPage = new JobSearchPage(page);
    this.submitToWorkflowPopup = new SubmitToWorkflowPopup(page);
    this.saveSearchTemplateModal = new SaveSearchTemplateModal(page);
    this.manageDashboardsPage = new ManageDashboardsPage(page);
    this.dashboardFactoidModal = new DashboardFactoidModal(page);
  }

  async navigateToCandidateSearch() {
    await this.personSearchPage.navigateTo();
  }

  async searchAndSubmitCandidatesToWorkflow(testData: {
    candidateCount: number;
    filterOption: string;
  }) {
    // Search for candidates
    await this.personSearchPage.runSearch();
    
    // Select candidates
    await this.personSearchPage.selectCandidates(testData.candidateCount);
    
    // Click Submit to Workflow
    await this.personSearchPage.clickSubmitToWorkflow();
    
    // Handle popup - may be new tab
    const pages = this.page.context().pages();
    let submitPage = this.page;
    
    if (pages.length > 1) {
      submitPage = pages[pages.length - 1];
      await submitPage.waitForLoadState('networkidle');
    }
    
    // Create popup instance for the correct page
    const submitPopup = new SubmitToWorkflowPopup(submitPage);
    await submitPopup.expectLoaded();
    
    // Select filter and job
    await submitPopup.selectFilter(testData.filterOption);
    await submitPopup.selectFirstJob();
    await submitPopup.addToSelected();
    
    // Submit
    await submitPopup.submit();
    await submitPopup.verifySuccess();
    await submitPopup.close();
  }

  async navigateToJobSearch() {
    await this.jobSearchPage.navigateTo();
  }

  async configureJobSearch(testData: {
    filters?: Array<{ name: string; treeItems?: string[]; value?: string; dropdownValue?: string }>;
    columns?: Array<{ name: string; treeItems?: string[] }>;
  }) {
    const filters = testData.filters || [];
    const columns = testData.columns || [];

    // Add filters
    for (const filter of filters) {
      await this.jobSearchPage.addFilter(filter.name, filter.treeItems || [filter.name]);
      
      if (filter.value) {
        await this.jobSearchPage.fillFilterValue(filter.value);
      }
      
      if (filter.dropdownValue) {
        await this.jobSearchPage.selectFilterDropdownValue(filter.dropdownValue);
      }
    }

    // Add columns
    for (const column of columns) {
      await this.jobSearchPage.addColumn(column.name, column.treeItems || [column.name]);
    }
  }

  async runJobSearch() {
    await this.jobSearchPage.runSearch();
  }

  async saveJobSearchTemplate(testData: {
    title: string;
    description?: string;
  }) {
    await this.jobSearchPage.openSaveSearchTemplate();
    await this.saveSearchTemplateModal.expectLoaded();
    
    await this.saveSearchTemplateModal.saveTemplate({
      title: testData.title,
      description: testData.description,
    });
  }

  async navigateToManageDashboards() {
    await this.manageDashboardsPage.navigateTo();
  }

  async createDashboard(testData: {
    name: string;
    type: string;
    position: string;
    share: string;
  }) {
    await this.manageDashboardsPage.createDashboard({
      name: testData.name,
      type: testData.type,
      position: testData.position,
      share: testData.share,
    });
  }

  async createFactoidWidget(testData: {
    name: string;
    searchTemplate: string;
    share: string;
  }) {
    await this.manageDashboardsPage.addWidget();
    await this.dashboardFactoidModal.expectLoaded();
    
    await this.dashboardFactoidModal.createFactoid({
      name: testData.name,
      searchTemplate: testData.searchTemplate,
      share: testData.share,
    });
  }

  async verifyFactoidVisible(widgetName: string) {
    await this.manageDashboardsPage.verifyFactoidVisible(widgetName);
  }

  async clickFactoidToNavigateToSearch(widgetName: string) {
    await this.manageDashboardsPage.clickFactoidWidget(widgetName);
  }

  async verifyOnJobSearchWithTemplate(templateName: string) {
    await this.jobSearchPage.verifySearchResults();
  }
}
