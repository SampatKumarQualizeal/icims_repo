// tests/specs/ats/ATS-T30112.spec.ts
import { test } from '@tests/governance';
import { Page } from '@playwright/test';
import { ProfileFieldsFlow } from '@src/flows/ats/profile-fields.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T30112: Custom Profile Field Creation and Validation - Part 2
 * 
 * Test Objective:
 * - Create a field group with multiple custom field types in the Contact tab
 * - Test visibility modes (editable, read-only, hidden) for custom fields
 * - Verify audit trail for field configuration changes
 * - Clean up all test data by deleting fields and field group
 * 
 * Note: Each test creates its own page and performs login independently.
 * Tests will run in parallel unless configured otherwise.
 */
test.describe('ATS-T30112: Custom Profile Field Creation - Part 2', () => {
    const testId = 'ATS-T30112';

    test(`${testId}: Create field group with 9 custom field types`, async ({
        baseTest,
        logger,
        testData,
        authPage
    }) => {
        const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
        
        const flow = new ProfileFieldsFlow(baseTest, page);

        logger.info('Step 1-4: Creating field group');

        // Navigate to Contact tab
        await flow.navigateToContactTab();

        // Create field group
        await flow.createFieldGroup(testData.fieldGroupName);

        logger.info('Step 5-7: Adding 9 custom fields to field group');
        // Add all 9 custom fields
        await flow.addFieldsToFieldGroup(testData);

        logger.info('✓ All 9 custom fields created successfully');

        logger.info('Step 8-17: Configuring fields as Read-Only');
        
        // Navigate to Contact tab
        await flow.navigateToContactTab();

        // Set all fields to read-only
        const fieldLabels = testData.fields.map((f: any) => f.label);
        await flow.setFieldsReadOnly(fieldLabels);

        logger.info('✓ Read-Only mode configured for all fields');
        // TODO: Navigate to person profile to verify Read-Only behavior

        logger.info('Step 18-23: Configuring fields as Hidden');
        
        // Navigate to Contact tab
        await flow.navigateToContactTab();

        // Set all fields to hidden
        await flow.setFieldsHidden(fieldLabels);

        logger.info('✓ Hidden mode configured for all fields');
        // TODO: Navigate to person profile to verify Hidden behavior

        logger.info('Step 24-26: Cleaning up test data');
        
        // Navigate to Contact tab
        await flow.navigateToContactTab();

        // Delete all fields
        await flow.deleteFields(fieldLabels);

        // Delete field group
        await flow.deleteFieldGroup(testData.fieldGroupName);

        logger.info('✓ Cleanup complete - all test data removed');
        logger.info('Starting full end-to-end test workflow');
        
        // Execute complete workflow
        await flow.completeFullWorkflow(testData);

        logger.info('✓ Full workflow completed successfully');
    });
});
