import { test } from '@tests/governance';
import { PersonCreateFlow } from '@src/flows/ats/person-create.flow';
import * as path from 'path';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29736: Text re-enter field validation for profile creation
 * 
 * Objective: Verify that text re-enter field validation works correctly when creating
 * a person profile. When 'Include Re-enter for validation' is enabled on a field,
 * different values in the actual field and confirm field should trigger validation errors.
 * 
 * Test Steps:
 * 1. Navigate to Create > Person > Person
 * 2. Fill required person details (First Name, Last Name, Email)
 * 3. Upload document (resume)
 * 4. Fill Login Information with mismatched passwords
 * 5. Verify validation error for password mismatch
 * 6. Fill matching passwords and complete profile creation
 * 
 * Precondition: 'Include re-enter for validation' must be enabled on password field
 */
test.describe('ATS-T29736: Text re-enter field validation', () => {

  test('ATS-T29736: Person profile creation with password re-enter validation', async ({
    baseTest,
    testData,
    authPage
  }) => {
    const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
    
    const flow = new PersonCreateFlow(baseTest, page);

    // Step 1: Navigate to person creation wizard
    await flow.navigateToPersonCreation();

    // Step 2: Fill basic person information
    await flow.fillBasicInformation({
      firstName: testData.basicInfo.firstName,
      lastName: testData.basicInfo.lastName,
      email: testData.basicInfo.email
    });

    // Step 3: Upload document
    const resumePath = path.join(process.cwd(), testData.document.resumePath);
    await flow.uploadDocument(resumePath);

    // Step 4-5: Test password mismatch validation
    await flow.testPasswordMismatch({
      password: testData.loginInfo.mismatchPassword,
      reenterPassword: testData.loginInfo.mismatchReenterPassword
    });

    // Step 6: Complete profile creation with matching passwords
    await flow.completeProfileCreation({
      password: testData.loginInfo.validPassword,
      reenterPassword: testData.loginInfo.validReenterPassword
    });
  });
});
