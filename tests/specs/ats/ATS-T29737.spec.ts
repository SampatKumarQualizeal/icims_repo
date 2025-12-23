import { test } from '@tests/governance';
import { PersonProfileEditFlow } from '@src/flows/ats/person-profile-edit.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29737: Text re-enter field validation for profile edit
 * 
 * Objective: Verify that text re-enter field validation works correctly when editing
 * a person profile. When 'Include Re-enter for validation' is enabled on a field,
 * different values in the actual field and confirm field should trigger validation errors.
 * 
 * Test Steps:
 * 1. Go to Person quick search
 * 2. Choose any person
 * 3. Open candidate details tab
 * 4. Click on Edit
 * 5. Enter value in original field, different value in re-enter field
 * 6. Verify validation error
 * 7. Enter same value in both fields
 * 8. Verify profile got saved
 * 
 * Precondition: 'Include re-enter for validation' checkbox must be checked for the field
 */
test.describe('ATS-T29737: Profile edit with text field re-enter validation', () => {

  test('ATS-T29737: Text field validation error when values dont match during profile edit', async ({
    baseTest,
    testData,
    authPage
  }) => {
    const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
    
    const flow = new PersonProfileEditFlow(baseTest, page);

    // Step 1-3: Navigate to person search and select a person
    await flow.navigateToPersonProfile({
      email: testData.searchCriteria.email
    });

    // Step 4: Open Detail tab and click Edit
    await flow.startEditingProfile();

    // Step 5-6: Test field mismatch validation
    await flow.testFieldMismatch(
      testData.field.label,
      testData.field.originalValue,
      testData.field.mismatchValue
    );

    // Step 7-8: Complete profile edit with matching values
    await flow.completeProfileEdit(
      testData.field.label,
      testData.field.validValue
    );
  });
});
