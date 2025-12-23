import { test } from '@tests/governance';
import { MultibrandCareerSiteFlow } from '@src/flows/cst/multibrand-career-site.flow';

/**
 * CST-T263: Multibrand Career Site Job Page Rendering
 * 
 * Objective: Verify that candidates can access and interact with job pages using multibrand 
 * rendering from CMS/Branding on Career Sites. Tests multibrand context URL functionality.
 * 
 * Features Tested:
 * - Multibrand API configuration endpoint
 * - CMS career site rendering (header, body, footer)
 * - Main domain multibrand routing
 * - Job search page with keyword search
 * - Location-based job search
 * - Category filtering
 * - Sort functionality
 * - Pagination controls
 * - Items per page selection
 * 
 * NO LOGIN REQUIRED - Public-facing career site
 */
test.describe('CST-T263: Multibrand Career Site Job Page', () => {
  
  test('CST-T263: Complete multibrand career site job search workflow', async ({ baseTest, testData }) => {
    const page = baseTest.page;
    const flow = new MultibrandCareerSiteFlow(baseTest, page);

    // Step 1: Verify multibrand API endpoint returns configuration
    await flow.verifyMultibrandAPI({
      apiUrl: testData.multibrandAPI.url,
      multibrandName: testData.multibrand.name,
      expectedConfig: testData.multibrandAPI.expectedConfig
    });

    // Step 2: Verify CMS career site with header, body, and footer
    await flow.verifyCMSCareerSite({
      cmsHost: testData.cmsSite.host,
      expectedTitle: testData.cmsSite.expectedTitle
    });

    // Step 3: Verify multibrand career site on main domain
    await flow.verifyMainDomainMultibrand({
      domain: testData.multibrand.domain,
      multibrandName: testData.multibrand.name,
      expectedTitle: testData.multibrandHome.expectedTitle
    });

    // Step 4: Navigate to jobs page with multibrand context
    await flow.navigateToJobsPage({
      domain: testData.multibrand.domain,
      multibrandName: testData.multibrand.name,
      expectedTitle: testData.jobsPage.expectedTitle,
      initialResultsCount: testData.jobsPage.initialResultsCount
    });

    // Step 6: Search jobs by keyword (job title)
    await flow.searchJobsByKeyword({
      keyword: testData.keywordSearch.keyword,
      expectedResultsCount: testData.keywordSearch.expectedResultsCount,
      expectedJobTitle: testData.keywordSearch.expectedJobTitle
    });

    // Clear keyword search
    await flow.clearKeywordSearch(testData.jobsPage.initialResultsCount);

    // Step 7: Search jobs by location
    await flow.searchJobsByLocation({
      location: testData.locationSearch.location,
      expectedResultsCount: testData.locationSearch.expectedResultsCount,
      expectedDistance: testData.locationSearch.expectedDistance,
      expectedDistanceUnit: testData.locationSearch.expectedDistanceUnit
    });

    // Clear location search
    await flow.clearLocationSearch(testData.jobsPage.initialResultsCount);

    // Step 8: Apply category filter
    await flow.applyCategoryFilter({
      categoryName: testData.categoryFilter.categoryName,
      expectedResultsCount: testData.categoryFilter.expectedResultsCount
    });

    // Remove category filter
    await flow.removeCategoryFilter(
      testData.categoryFilter.categoryName, 
      testData.jobsPage.initialResultsCount
    );

    // Step 9: Test sort functionality
    await flow.testSortFunctionality({
      sortOption: testData.sortTest.sortOption,
      expectedURLParams: testData.sortTest.expectedURLParams
    });

    // Step 10: Test items per page (change to 25, then back to 10)
    // First change to 25
    await flow.testItemsPerPage({
      itemsPerPage: 25,
      expectedPaginationStart: 1,
      expectedPaginationEnd: testData.jobsPage.initialResultsCount,
      totalJobs: testData.jobsPage.initialResultsCount
    });

    // Change back to 10
    await flow.testItemsPerPage({
      itemsPerPage: 10,
      expectedPaginationStart: 1,
      expectedPaginationEnd: 10,
      totalJobs: testData.jobsPage.initialResultsCount
    });

    // Step 11: Test pagination navigation (Next -> Previous)
    await flow.testPaginationNavigation({
      nextPage: {
        page: 2,
        start: 11,
        end: testData.jobsPage.initialResultsCount,
        total: testData.jobsPage.initialResultsCount
      },
      prevPage: {
        page: 1,
        start: 1,
        end: 10,
        total: testData.jobsPage.initialResultsCount
      }
    });
  });
});
