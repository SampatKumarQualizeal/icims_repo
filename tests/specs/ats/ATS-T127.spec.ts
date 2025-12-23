// tests/specs/ats/ATS-T127.spec.ts
import { test } from '@tests/governance';
import { IFormFlow } from '@src/flows/ats/iform.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

test.describe('ATS iForm - Create with All Field Types', () => {

    test('ATS-T127: Create iForm with all field types', async ({
        baseTest,
        logger,
        testData,
        authPage,
        tabs
    }) => {
        const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
        
        const flow = new IFormFlow(baseTest, page);

        // Step 1-2: Navigate and create iForm
        await flow.navigateAndCreateIForm(testData);

        // Step 3: Configure Views page with field placeholders
        await flow.configureViewsPage(testData);

        // Step 4: Insert grouploop and dependent field group
        // (handled in configureViewsPage)

        // Step 5: Navigate to Questions page
        // (handled in configureViewsPage)

        // Step 6-8: Configure field types
        await flow.configureFieldTypes(testData);

        // Configure field settings (required, searchable, sections, data fields)
        await flow.configureFieldSettings(testData);

        // Handle profile field selection popup
        if (testData.profileFieldPath) {
            await flow.selectProfileField(testData, tabs);
        }

        // Step 9-10: Navigate to Sections and save
        await flow.navigateToSections();

        // Step 11-12: Create Field Dependency
        await flow.createFieldDependency(testData, tabs);

        // Navigate to Maintenance tab
        await flow.dependenciesPage.navigateToMaintenance();

        // Step 13-14: Enable iForm
        await flow.enableIForm();

        // Step 15: Test duplicate field handling
        await flow.testDuplicateFieldHandling(testData);

        // Verify duplicate warning and field renaming
        await flow.verifyDuplicateWarning();
        await flow.verifyFieldRenamed();
    });
});
