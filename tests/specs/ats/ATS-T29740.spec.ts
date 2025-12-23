// tests/specs/ats/ATS-T29740.spec.ts
import { test } from '@tests/governance';
import { PersonProfileEditFlow } from '@src/flows/ats/person-profile-edit.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29740: Verify validation error when re-enter field has value but original field is empty
 * 
 * Objective: This test validates that when a user enters a value in the re-enter field (Password Retype)
 * but leaves the original field (Password) empty, the system displays a validation error.
 * 
 * Precondition: Re-enter for validation should be enabled on the Password field
 * 
 * Expected Result: The system should throw a validation error: "Password: Please ensure that both password fields match."
 */
test.describe('ATS-T29740: Password Field Re-enter Validation', () => {
    test('ATS-T29740: Validation error when original field is empty', async ({
        baseTest,
        authPage,
        testData
    }) => {
        const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
        
        const flow = new PersonProfileEditFlow(baseTest, page);

        // Step 1-3: Navigate to person search, select person, and open Login tab
        await flow.navigateToLoginTab(testData.personName);

        // Step 4-6: Test password validation - leave password empty, fill retype, verify error
        await flow.testPasswordValidation({
            password: testData.password,
            retypePassword: testData.retypePassword,
            expectedAlertMessage: testData.expectedAlertMessage,
            expectedInlineMessage: testData.expectedInlineMessage
        });
    });
});
