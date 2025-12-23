// tests/specs/ats/ATS-T29634.spec.ts
import { test } from '@tests/governance';
import { IFormFlow } from '@src/flows/ats/iform.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29634: iForm Date Validation Testing
 * 
 * Test Objective:
 * - Create an iForm with date fields
 * - Configure date field validations (Allow Only Past Date, Allow Only Future Date)
 * - Test validation error messages for invalid dates
 * - Test successful form submission with valid dates
 * - Clean up by deleting the test iForm
 */
test.describe('ATS-T29634: iForm Date Validation', () => {
    const testId = 'ATS-T29634';
    let sharedPage: any;

    test(`${testId}: Create iForm with date fields`, async ({
        baseTest,
        logger,
        testData,
        authPage,
        context
    }) => {
        const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
        
        const flow = new IFormFlow(baseTest, page);

        logger.info('Step 1: Navigate to iForms management and create iForm');
        await flow.navigateAndCreateIForm(testData);

        logger.info('Step 2: Configure Views tab with date field placeholders');
        await flow.navigateToIFormViews(testData.iFormId);
        await flow.configureViews(testData);

        logger.info('Step 3: Configure Questions tab with Date Only Fields and validations');
        await flow.navigateToIFormQuestions(testData.iFormId);
        await flow.configureQuestionsWithPopup(testData, context);

        logger.info('Step 4: Enable the iForm');
        await flow.navigateToIFormMaintenance(testData.iFormId);
        await flow.enableIForm();

        logger.info('✓ iForm created and configured successfully');
        logger.info('Step 5: Navigate to Person profile and access iForms');
        await flow.searchAndOpenPerson(testData.testPersonName);
        await flow.navigateToPersonIForms(
            testData.iFormId,
            testData.fields.map((f: any) => f.name)
        );

        logger.info('Step 6: Test invalid future date in past date field');
        await flow.testDateValidation({
            validationScenarios: [testData.validationScenarios[0]]
        });

        logger.info('✓ Past date validation error verified');

        logger.info('Step 7: Navigate to Person profile and access iForms');
        await flow.searchAndOpenPerson(testData.testPersonName);
        await flow.navigateToPersonIForms(
            testData.iFormId,
            testData.fields.map((f: any) => f.name)
        );

        logger.info('Step 8: Test invalid past date in future date field');
        await flow.testDateValidation({
            validationScenarios: [testData.validationScenarios[1]]
        });

        logger.info('✓ Future date validation error verified');
        logger.info('Step 9: Navigate to Person profile and access iForms');
        await flow.searchAndOpenPerson(testData.testPersonName);
        await flow.navigateToPersonIForms(
            testData.iFormId,
            testData.fields.map((f: any) => f.name)
        );

        logger.info('Step 10: Test valid dates for both fields');
        await flow.testDateValidation({
            validationScenarios: [testData.validationScenarios[2]]
        });

        logger.info('✓ Form saved successfully with valid dates');
        logger.info('Step 11: Delete the test iForm');
        await flow.deleteIForm(testData.iFormId);

        logger.info('✓ Test iForm deleted successfully');
    });

});
