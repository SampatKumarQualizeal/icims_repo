// tests/specs/ats/ATS-T29742.spec.ts
import { test } from '@tests/governance';
import { PersonProfileEditFlow } from '@src/flows/ats/person-profile-edit.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29742: Portal Re-enter Validation - Different values in both fields
 * 
 * Objective: Verify that when different values are entered in the Password and Password (Retype) fields,
 * the system displays a validation error preventing the save operation.
 * 
 * Precondition: 
 * - Re-enter field is available on portal
 * - Include re-enter for validation should be enabled
 * 
 * Expected Result: Validation error "Password fields must match" should be displayed
 */
test.describe('ATS-T29742: Password Field Mismatch Validation', () => {
    test('ATS-T29742: Validation error when different values entered in both fields', async ({
        baseTest,
        authPage,
        testData
    }) => {
        const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
        
        const flow = new PersonProfileEditFlow(baseTest, page);

        // Step 1-3: Navigate to person search, select person, and open Login tab
        await flow.navigateToLoginTab(testData.personName);

        // Step 4-6: Test password validation - fill both fields with different values, verify error
        await flow.testPasswordValidation({
            password: testData.password,
            retypePassword: testData.retypePassword,
            expectedAlertMessage: testData.expectedAlertMessage,
            expectedInlineMessage: testData.expectedInlineMessage
        });
    });
});
