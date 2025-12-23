// tests/specs/ats/ATS-T29743.spec.ts
import { test } from '@tests/governance';
import { PersonProfileEditFlow } from '@src/flows/ats/person-profile-edit.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29743: Portal Re-enter Validation - Original field filled, re-enter field empty
 * 
 * Objective: Verify that when a value is entered in the Password field but the Password (Retype) field is left empty,
 * the system displays a validation error preventing the save operation.
 * 
 * Precondition: 
 * - Field is available on portal
 * - Include re-enter for validation should be enabled
 * 
 * Expected Result: Validation error "Password fields must match" should be displayed
 */
test.describe('ATS-T29743: Password Field Re-enter Validation', () => {
    test('ATS-T29743: Validation error when Password field is filled but Retype field is empty', async ({
        baseTest,
        authPage,
        testData
    }) => {
        const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
        
        const flow = new PersonProfileEditFlow(baseTest, page);

        // Step 1-3: Navigate to person search, select person, and open Login tab
        await flow.navigateToLoginTab(testData.personName);

        // Step 4-6: Test password validation - fill password, leave retype empty, verify error
        await flow.testPasswordValidation({
            password: testData.password,
            retypePassword: testData.retypePassword,
            expectedAlertMessage: testData.expectedAlertMessage,
            expectedInlineMessage: testData.expectedInlineMessage
        });
    });
});
