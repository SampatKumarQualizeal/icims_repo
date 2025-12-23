import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { MultibrandJobsPage } from '@src/pages/cst/multibrand-jobs.page';
import { MultibrandCMSPage } from '@src/pages/cst/multibrand-cms.page';
import { MultibrandHomePage } from '@src/pages/cst/multibrand-home.page';

/**
 * MultibrandCareerSiteFlow
 * Orchestrates multibrand career site workflows:
 * - Verify multibrand API configuration
 * - Verify CMS career site rendering
 * - Verify main domain multibrand routing
 * - Search and filter jobs on multibrand jobs page
 * - Test pagination and sorting
 * 
 * NO LOGIN REQUIRED - Public-facing career site
 */
export class MultibrandCareerSiteFlow extends BaseFlow {
  private jobsPage: MultibrandJobsPage;
  private cmsPage: MultibrandCMSPage;
  private homePage: MultibrandHomePage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.jobsPage = new MultibrandJobsPage(page);
    this.cmsPage = new MultibrandCMSPage(page);
    this.homePage = new MultibrandHomePage(page);
  }

  /**
   * Step 1: Verify multibrand API context endpoint
   */
  async verifyMultibrandAPI(testData: { 
    apiUrl: string; 
    multibrandName: string;
    expectedConfig: { 
      name: string; 
      overrideCMSHost: boolean; 
      title: string; 
      description: string;
    }
  }) {
    await this.base.logger.section('Verify multibrand API endpoint', async () => {
      await this.page.goto(testData.apiUrl);
      
      // Get page content (JSON response)
      const pageContent = await this.page.textContent('body');
      if (!pageContent) {
        throw new Error('No content returned from API endpoint');
      }
      
      // Verify required configuration fields
      const verifications = [
        { field: 'name', value: testData.expectedConfig.name },
        { field: 'overrideCMSHost', value: String(testData.expectedConfig.overrideCMSHost) },
        { field: 'metadata', value: null },
        { field: 'title', value: testData.expectedConfig.title },
        { field: 'description', value: testData.expectedConfig.description }
      ];
      
      for (const verification of verifications) {
        const searchString = verification.value 
          ? `"${verification.field}":"${verification.value}"`
          : `"${verification.field}"`;
        
        await this.base.soft.assertThat(pageContent.includes(searchString))
          .truthy(`API response verify expected field: ${verification.field}`);
      }
      
      // Report all soft assertion failures
      await this.base.soft.report();
    });
  }

  /**
   * Step 2: Verify CMS career site with header, body, and footer
   */
  async verifyCMSCareerSite(testData: { cmsHost: string; expectedTitle: string }) {
    await this.base.logger.section('Verify CMS career site rendering', async () => {
      await this.cmsPage.navigateTo(testData.cmsHost);
      await this.cmsPage.verifyPageTitle(testData.expectedTitle);
      await this.cmsPage.verifyPageLoaded();
      this.base.logger.info('✓ CMS career site rendered with header, body, and footer');
    });
  }

  /**
   * Step 3: Verify multibrand career site on main domain
   */
  async verifyMainDomainMultibrand(testData: { 
    domain: string; 
    multibrandName: string; 
    expectedTitle: string 
  }) {
    await this.base.logger.section('Verify multibrand on main domain', async () => {
      await this.homePage.navigateTo(testData.domain, testData.multibrandName);
      await this.homePage.verifyPageTitle(testData.expectedTitle);
      await this.homePage.verifyPageLoaded();
      this.base.logger.info('✓ Multibrand career site rendered on main domain');
    });
  }

  /**
   * Step 4: Navigate to jobs page with multibrand context
   */
  async navigateToJobsPage(testData: { 
    domain: string; 
    multibrandName: string; 
    expectedTitle: string;
    initialResultsCount: number;
  }) {
    await this.base.logger.section('Navigate to jobs page', async () => {
      await this.jobsPage.navigateTo(testData.domain, testData.multibrandName);
      
      // Verify page loaded
      const actualTitle = await this.page.title();
      if (actualTitle !== testData.expectedTitle) {
        throw new Error(`Page title mismatch. Expected: "${testData.expectedTitle}", Actual: "${actualTitle}"`);
      }
      this.base.logger.info(`✓ Page title: ${actualTitle}`);
      
      await this.jobsPage.expectLoaded();
      await this.jobsPage.verifyResultsCount(testData.initialResultsCount);
      this.base.logger.info(`✓ Jobs page loaded with ${testData.initialResultsCount} results`);
    });
  }

  /**
   * Step 6: Search jobs by keyword (job title)
   */
  async searchJobsByKeyword(testData: { 
    keyword: string; 
    expectedResultsCount: number;
    expectedJobTitle?: string;
  }) {
    await this.base.logger.section(`Search jobs by keyword: ${testData.keyword}`, async () => {
      await this.jobsPage.searchByKeyword(testData.keyword);
      
      // Verify URL contains keywords parameter
      await this.jobsPage.verifyURLParam('keywords', testData.keyword.replace(' ', '%20'));
      
      // Verify filtered results count
      await this.jobsPage.verifyResultsCount(testData.expectedResultsCount);
      
      // Verify at least one expected job appears
      if (testData.expectedJobTitle) {
        await this.jobsPage.verifyJobInResults(testData.expectedJobTitle);
      }
      
      this.base.logger.info(`✓ Keyword search filtered to ${testData.expectedResultsCount} results`);
    });
  }

  /**
   * Clear keyword search and restore results
   */
  async clearKeywordSearch(expectedResultsCount: number) {
    await this.base.logger.section('Clear keyword search', async () => {
      await this.jobsPage.removeKeywordFilter();
      await this.jobsPage.verifyResultsCount(expectedResultsCount);
      this.base.logger.info(`✓ Keyword filter removed, results restored to ${expectedResultsCount}`);
    });
  }

  /**
   * Step 7: Search jobs by location
   */
  async searchJobsByLocation(testData: { 
    location: string; 
    expectedResultsCount: number;
    expectedDistance: number;
    expectedDistanceUnit: string;
  }) {
    await this.base.logger.section(`Search jobs by location: ${testData.location}`, async () => {
      await this.jobsPage.searchByLocation(testData.location);
      
      // Verify URL contains location and distance parameters
      await this.jobsPage.verifyURLParam('location', testData.location.replace(' ', '%20'));
      await this.jobsPage.verifyURLParam('stretch', String(testData.expectedDistance));
      await this.jobsPage.verifyURLParam('stretchUnit', testData.expectedDistanceUnit);
      
      // Verify filtered results count
      await this.jobsPage.verifyResultsCount(testData.expectedResultsCount);
      
      // Verify location proximity message
      await this.jobsPage.verifyLocationProximity(testData.location);
      
      this.base.logger.info(`✓ Location search filtered to ${testData.expectedResultsCount} results`);
    });
  }

  /**
   * Clear location search and restore results
   */
  async clearLocationSearch(expectedResultsCount: number) {
    await this.base.logger.section('Clear location search', async () => {
      await this.jobsPage.removeLocationFilter();
      await this.jobsPage.verifyResultsCount(expectedResultsCount);
      this.base.logger.info(`✓ Location filter removed, results restored to ${expectedResultsCount}`);
    });
  }

  /**
   * Step 8: Apply category filter
   */
  async applyCategoryFilter(testData: { 
    categoryName: string; 
    expectedResultsCount: number;
  }) {
    await this.base.logger.section(`Apply category filter: ${testData.categoryName}`, async () => {
      await this.jobsPage.selectCategoryFilter(testData.categoryName);
      
      // Verify URL contains category parameter
      await this.jobsPage.verifyURLParam('categories', testData.categoryName);
      
      // Verify filtered results count
      await this.jobsPage.verifyResultsCount(testData.expectedResultsCount);
      
      // Verify filter tag appears
      await this.jobsPage.verifyFilterSelected(testData.categoryName);
      
      this.base.logger.info(`✓ Category filter applied: ${testData.categoryName}`);
    });
  }

  /**
   * Remove category filter and restore results
   */
  async removeCategoryFilter(categoryName: string, expectedResultsCount: number) {
    await this.base.logger.section(`Remove category filter: ${categoryName}`, async () => {
      await this.jobsPage.removeCategoryFilter(categoryName);
      await this.jobsPage.verifyResultsCount(expectedResultsCount);
      this.base.logger.info(`✓ Category filter removed, results restored to ${expectedResultsCount}`);
    });
  }

  /**
   * Step 9: Test sort functionality
   */
  async testSortFunctionality(testData: { 
    sortOption: string; 
    expectedURLParams: { sortBy: string; descending: string };
  }) {
    await this.base.logger.section(`Test sort: ${testData.sortOption}`, async () => {
      await this.jobsPage.selectSortOption(testData.sortOption);
      
      // Wait for results to reload
      await this.page.waitForTimeout(2000);
      
      // Verify URL contains sortBy parameters
      await this.jobsPage.verifyURLParam('sortBy', testData.expectedURLParams.sortBy);
      await this.jobsPage.verifyURLParam('descending', testData.expectedURLParams.descending);
      
      this.base.logger.info(`✓ Sort applied: ${testData.sortOption}`);
    });
  }

  /**
   * Step 10: Test items per page functionality
   */
  async testItemsPerPage(testData: { 
    itemsPerPage: number; 
    expectedPaginationStart: number;
    expectedPaginationEnd: number;
    totalJobs: number;
  }) {
    await this.base.logger.section(`Change items per page to: ${testData.itemsPerPage}`, async () => {
      await this.jobsPage.changeItemsPerPage(testData.itemsPerPage);
      
      // Verify URL contains limit parameter
      await this.jobsPage.verifyURLParam('limit', String(testData.itemsPerPage));
      
      // Verify pagination info
      await this.jobsPage.verifyPaginationInfo(
        testData.expectedPaginationStart, 
        testData.expectedPaginationEnd, 
        testData.totalJobs
      );
      
      // Verify Next button state
      const shouldHaveNext = testData.expectedPaginationEnd < testData.totalJobs;
      await this.jobsPage.verifyNextButtonState(shouldHaveNext);
      
      this.base.logger.info(`✓ Items per page changed to ${testData.itemsPerPage}`);
    });
  }

  /**
   * Step 11: Test pagination navigation
   */
  async testPaginationNavigation(testData: {
    nextPage: {
      page: number;
      start: number;
      end: number;
      total: number;
    };
    prevPage: {
      page: number;
      start: number;
      end: number;
      total: number;
    };
  }) {
    await this.base.logger.section('Test pagination navigation', async () => {
      // Verify Previous button is disabled on first page
      await this.jobsPage.verifyPrevButtonState(false);
      
      // Verify Next button is enabled
      await this.jobsPage.verifyNextButtonState(true);
      
      // Go to next page
      await this.jobsPage.goToNextPage();
      
      // Verify URL shows page 2
      await this.jobsPage.verifyURLParam('page', String(testData.nextPage.page));
      
      // Verify pagination info for page 2
      await this.jobsPage.verifyPaginationInfo(
        testData.nextPage.start, 
        testData.nextPage.end, 
        testData.nextPage.total
      );
      
      // Verify Previous button is now enabled
      await this.jobsPage.verifyPrevButtonState(true);
      
      // Go back to previous page
      await this.jobsPage.goToPreviousPage();
      
      // Verify URL shows page 1
      await this.jobsPage.verifyURLParam('page', String(testData.prevPage.page));
      
      // Verify pagination info for page 1
      await this.jobsPage.verifyPaginationInfo(
        testData.prevPage.start, 
        testData.prevPage.end, 
        testData.prevPage.total
      );
      
      // Verify Previous button is disabled again
      await this.jobsPage.verifyPrevButtonState(false);
      
      this.base.logger.info('✓ Pagination navigation working correctly');
    });
  }
}
