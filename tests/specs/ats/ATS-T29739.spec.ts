// tests/specs/ats/ATS-T29739.spec.ts
import { test } from '@tests/governance';
import { PersonProfileEditFlow } from '@src/flows/ats/person-profile-edit.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29739: Verify validation error when original field has value but re-enter field is empty
 * 
 * Objective: This test validates that when a user enters a value in the original field (Password)
 * but leaves the re-enter field (Password Retype) empty, the system displays a validation error.
 * 
 * Precondition: Re-enter for validation should be enabled on the Password field
 * 
 * Expected Result: The system should throw a validation error: "Password fields must match"
 */
test.describe('ATS-T29739: Password Field Re-enter Validation', () => {
    test('ATS-T29739: Validation error when re-enter field is empty', async ({
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