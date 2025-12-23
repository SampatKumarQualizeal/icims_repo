// tests/specs/ats/ATS-T29635.spec.ts
import { test } from '@tests/governance';
import { IFormFlow } from '@src/flows/ats/iform.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29635: iForm Date Validation - Positive Testing
 * 
 * Test Objective:
 * - Create an iForm with date fields
 * - Configure date field validations (Allow Only Past Date, Allow Only Future Date)
 * - Test that VALID dates are ACCEPTED without errors
 * - Verify successful form submission with valid dates
 * - Clean up by deleting the test iForm
 * 
 * Key Difference from ATS-T29634:
 * - T29634: Tests INVALID dates, expects ERROR messages (negative testing)
 * - T29635: Tests VALID dates, expects SUCCESSFUL saves (positive testing)
 */
test.describe('ATS-T29635: iForm Date Validation - Positive Testing', () => {
  const testId = 'ATS-T29635';


  test(`${testId}: Create iForm with date fields`, async ({
    baseTest,
    logger,
    testData,
    authPage,
    context
  }) => {
    const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
    
    const flow = new IFormFlow(baseTest, page);
    // logger.info('Step 1: Navigate to iForms management and create iForm');
    await flow.navigateAndCreateIForm(testData);

    // logger.info('Step 2: Configure Views tab with date field placeholders');
    await flow.configureViews(testData);

    // logger.info('Step 3: Configure Questions tab with Date Only Fields and validations');
    await flow.navigateToIFormQuestions(testData.iFormId);
    await flow.configureQuestionsWithPopup(testData, context);

    // logger.info('Step 4: Enable the iForm');
    await flow.navigateToIFormMaintenance(testData.iFormId);
    await flow.enableIForm();

    // logger.info('Step 5: Navigate to Person profile and access iForms');
    await flow.searchAndOpenPerson(testData.testPersonName);
    await flow.navigateToPersonIForms(
      testData.iFormId,
      testData.fields.map((f: any) => f.name)
    );

    // logger.info('Step 6: Test valid past date (12/10/2025) - should save successfully');
    await flow.testDateValidation({
      validationScenarios: [testData.validationScenarios[0]]
    });

    // logger.info('✓ Valid past date accepted - no errors displayed');

    // logger.info('Step 7: Navigate to Person profile and access iForms');
    await flow.searchAndOpenPerson(testData.testPersonName);
    await flow.navigateToPersonIForms(
      testData.iFormId,
      testData.fields.map((f: any) => f.name)
    );

    // logger.info('Step 8: Test valid future date (12/12/2025) with past date - both should save successfully');
    await flow.testDateValidation({
      validationScenarios: [testData.validationScenarios[1]]
    });

    // logger.info('✓ Both valid dates accepted - form saved successfully');
    // TO DO - Delete or disable iform is not handled 
    // logger.info('Step 9: Delete the test iForm');
    // await flow.deleteIForm(testData.iFormId);
    // logger.info('✓ Test iForm deleted successfully');
  });

});
