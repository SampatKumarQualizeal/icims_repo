// tests/specs/ats/ATS-T28669.spec.ts
import { test } from '@tests/governance';
import { JobSearchFlow } from '@src/flows/ats/job-search.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

test.describe('ATS-T28669: Job Search Template and Dashboard Factoid Creation', () => {
    test(
        'ATS-T28669: Job Search Template and Dashboard Factoid Creation',
        async ({ baseTest, authPage, testData }) => {
            const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
            
            const jobSearchFlow = new JobSearchFlow(page);

            // Step 1-4: Navigate to Candidate Search and submit to workflow
            await jobSearchFlow.navigateToCandidateSearch();

            await jobSearchFlow.searchAndSubmitCandidatesToWorkflow({
                candidateCount: testData.candidateCount,
                filterOption: testData.submitFilterOption,
            });

            // Step 5-6: Navigate to Job Search
            await jobSearchFlow.navigateToJobSearch();

            // Step 7: Configure job search with filters
            await jobSearchFlow.configureJobSearch({
                filters: testData.jobFilters,
            });

            // Run search
            await jobSearchFlow.runJobSearch();

            // Step 8: Save search template
            await jobSearchFlow.saveJobSearchTemplate({
                title: testData.searchTemplateTitle,
                description: testData.searchTemplateDescription,
            });

            // Step 9: Navigate to Manage Dashboards
            await jobSearchFlow.navigateToManageDashboards();

            // Step 10: Create dashboard
            await jobSearchFlow.createDashboard({
                name: testData.dashboardName,
                type: testData.dashboardType,
                position: testData.dashboardPosition,
                share: testData.dashboardShare,
            });

            // Step 11: Create factoid widget
            await jobSearchFlow.createFactoidWidget({
                name: testData.factoidName,
                searchTemplate: testData.searchTemplateTitle,
                share: testData.factoidShare,
            });

            // Step 12: Verify factoid visible on dashboard
            await jobSearchFlow.verifyFactoidVisible(testData.factoidName);

            // Step 13: Click factoid to navigate to search
            await jobSearchFlow.clickFactoidToNavigateToSearch(testData.factoidName);

            // Verify we're on Job Search with template loaded
            await jobSearchFlow.verifyOnJobSearchWithTemplate(testData.searchTemplateTitle);
        }
    );
});
