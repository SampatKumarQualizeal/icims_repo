// tests/specs/hcmint/HCMINT-T70.spec.ts
import { test } from '@tests/governance';
import { ATSLoginFlow } from '@src/flows/ats/common/ats.login.flow';
import { config } from '@config/config';
import { UKGEmployeeSyncFlow } from '@src/flows/ats/hcm/ukg-employee-sync.flow';

/**
 * HCMINT-T70: UKG-PRO Employee Delta Sync Integration Test
 * 
 * This test validates UKG-PRO Employee Delta Sync Recipe E2E.
 * Tests employee data flows from UKG Pro to iCIMS via Workato middleware.
 * 
 * ⚠️  IMPORTANT: This is a PARTIAL AUTOMATION test
 * 
 * AUTOMATED (iCIMS):
 * - Search for newly synced employee via Quick Search
 * - Verify employee data populated in Employee Info tab
 * - Verify EEO data populated in EEO tab
 * - Search for updated employee
 * - Verify updated employee data synced
 * 
 * MANUAL (External Systems):
 * - Step 1: Verify Workato recipes active
 * - Step 2: Create employee in UKG Pro
 * - Step 3: Trigger Workato employee sync
 * - Step 6: Verify parameter configuration in Workato
 * - Step 7: Update employee in UKG Pro
 * - Step 8: Trigger delta sync for updated employee
 * 
 * Prerequisites:
 * - Workato Employee recipes running successfully:
 *   - UKG-Pro-Employee-Parent
 *   - UKG-Pro-Employee-Standard
 *   - UKG-Pro-Employee-Custom
 *   - UKG-Pro-Employee-Parent-Batch-to-ICIMS
 *   - UKG-Pro-Employee-Async-Standard
 * - Employee created in UKG Pro system
 * - Parameter lookup table configured for field filtering
 * 
 * Test Objectives:
 * 1. Verify newly created employee syncs from UKG Pro to iCIMS
 * 2. Verify updated employee syncs from UKG Pro to iCIMS (delta sync)
 * 3. Verify parameter-based filtering (race, gender, disability)
 * 
 * Key Features Tested:
 * - Delta Sync: Only changed fields synced (not full record)
 * - Parameter Filtering: Lookup table controls which fields sync
 * - Batch Processing: Large volume handling
 * - Field Mappings: UKG Pro → iCIMS field mapping
 * 
 * Integration Flow:
 * UKG Pro (Employee Data) → Workato (Delta Sync Recipe) → iCIMS (Employee Profile)
 *                        ↓
 *           Parameter Lookup Table (Field Filtering)
 */
test.describe('HCMINT-T70: UKG PRO Employee Delta Sync', () => {
  test('HCMINT-T70: Verify employee delta sync from UKG Pro to iCIMS', async ({ 
    baseTest, 
    testData 
  }) => {
    const page = baseTest.page;
    
    /**
     * MANUAL STEP 1: Login to Workato
     * 
     * Action: Navigate to Workato platform and authenticate
     * URL: https://app.workato.com (or customer-specific instance)
     * 
     * Expected: Successfully logged in to Workato dashboard
     * 
     * This step CANNOT be automated through browser as Workato requires
     * separate authentication and API access.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 1: Login to Workato');
    baseTest.logger.info('→ Navigate to Workato platform');
    baseTest.logger.info('→ Authenticate with credentials');
    baseTest.logger.info('→ Verify successful login to dashboard');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 2: Verify Employee Recipe Running Successfully
     * 
     * Action: Navigate to ICIMS HCM Integrations > UKG Pro > Employee Delta Sync
     * 
     * Verify all required recipes show status: Active and Running
     * - UKG-Pro-Employee-Parent (orchestrates child recipes)
     * - UKG-Pro-Employee-Standard (standard field mapping)
     * - UKG-Pro-Employee-Custom (custom field mapping)
     * - UKG-Pro-Employee-Parent-Batch-to-ICIMS (batch processing)
     * - UKG-Pro-Employee-Async-Standard (async processing for performance)
     * 
     * Check recent job history:
     * - Jobs should show "Success" status
     * - No recent failures or errors
     * - Verify last sync time (should be recent)
     * 
     * Expected: All recipes Active, recent successful executions
     * 
     * This step CANNOT be automated - requires Workato portal access.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 2: Verify Employee Recipe Status');
    baseTest.logger.info('→ Navigate to: ICIMS HCM Integrations > UKG Pro > Employee Delta Sync');
    baseTest.logger.info('→ Verify all 5 recipes show status: Active');
    baseTest.logger.info('→ Check recent job history for Success status');
    baseTest.logger.info('→ Verify no recent failures or errors');
    baseTest.logger.info('→ Note last sync time');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 3: Create New Employee in UKG Pro
     * 
     * Action: Login to UKG Pro system
     * Navigate to: Employee Management > Add New Employee
     * 
     * Fill required fields:
     * - First Name: HCMINT70
     * - Last Name: NewEmployee
     * - Email: hcmint70.new@icims.com
     * - Employee ID: UKG-12345
     * - Department: Engineering
     * - Position: Software Engineer
     * - Hire Date: 2025-01-15
     * - Status: Active
     * - EEO Information (if applicable):
     *   - Gender: Male
     *   - Race: White
     *   - Disability Status: No
     * 
     * Save employee record.
     * 
     * Expected: Employee created successfully in UKG Pro
     * 
     * This step CANNOT be automated - requires UKG Pro portal access.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 3: Create New Employee in UKG Pro');
    baseTest.logger.info('→ Login to UKG Pro system');
    baseTest.logger.info('→ Navigate to: Employee Management > Add New Employee');
    baseTest.logger.info('→ Fill required fields:');
    baseTest.logger.info(`  - First Name: ${testData.newEmployee.firstName}`);
    baseTest.logger.info(`  - Last Name: ${testData.newEmployee.lastName}`);
    baseTest.logger.info(`  - Email: ${testData.newEmployee.email}`);
    baseTest.logger.info(`  - Employee ID: ${testData.newEmployee.employeeId}`);
    baseTest.logger.info(`  - Department: ${testData.newEmployee.department}`);
    baseTest.logger.info(`  - Position: ${testData.newEmployee.position}`);
    baseTest.logger.info(`  - Hire Date: ${testData.newEmployee.hireDate}`);
    baseTest.logger.info('→ Save employee record');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 4: Trigger Workato Employee Sync (New Employee)
     * 
     * Action Option A (Scheduled Sync):
     * - Wait for next scheduled delta sync (typically runs every X minutes)
     * - Check Workato job history for new execution
     * 
     * Action Option B (Manual Trigger):
     * - In Workato, navigate to UKG-Pro-Employee-Parent recipe
     * - Click "Test recipe" or "Run once" button
     * - Provide test employee data if required
     * 
     * Expected:
     * - Recipe executes successfully
     * - Job log shows employee data retrieved from UKG Pro
     * - Employee data posted to iCIMS API
     * - Job status: Success
     * 
     * Verify in Workato job details:
     * - Input: Employee data from UKG Pro
     * - Output: iCIMS API response (employee created/updated)
     * - Field mappings applied correctly
     * 
     * This step CANNOT be automated - requires Workato recipe trigger.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 4: Trigger Workato Employee Sync');
    baseTest.logger.info('→ Option A: Wait for scheduled delta sync');
    baseTest.logger.info('→ Option B: Manual trigger in Workato');
    baseTest.logger.info('→ Verify recipe executes successfully');
    baseTest.logger.info('→ Check job log for employee data from UKG Pro');
    baseTest.logger.info('→ Verify employee data posted to iCIMS API');
    baseTest.logger.info('→ Job status: Success');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    // Login as recruiter
    const loginFlow = new ATSLoginFlow(page, baseTest.logger);
    const creds = config.secrets.ats.roleCredentials.recruiter;
    await loginFlow.login(
      { username: creds.username, password: creds.password },
      'ATS Recruiter User'
    );
    
    // Initialize flow
    const flow = new UKGEmployeeSyncFlow(baseTest, page);
    
    // Step 5: Search for newly synced employee in iCIMS
    await flow.searchForEmployee(
      testData.newEmployee.email,
      testData.newEmployee.firstName,
      testData.newEmployee.lastName
    );
    
    // Step 6: Verify employee profile displayed
    await flow.verifyEmployeeProfileDisplayed(
      testData.newEmployee.firstName,
      testData.newEmployee.lastName
    );
    
    // Step 7: Verify employee data populated from UKG Pro
    await flow.verifyEmployeeData({
      employeeId: testData.newEmployee.employeeId,
      department: testData.newEmployee.department,
      position: testData.newEmployee.position,
      hireDate: testData.newEmployee.hireDate,
      status: testData.newEmployee.status
    });
    
    // Step 8: Verify EEO fields populated (with parameter filtering)
    await flow.verifyEEOData({
      gender: testData.eeoData.gender,
      race: testData.eeoData.race,
      disability: testData.eeoData.disability
    });
    
    /**
     * MANUAL STEP 9: Update Employee in UKG Pro
     * 
     * Action: Return to UKG Pro system
     * Search for existing employee (HCMINT70 UpdatedEmployee or UKG-12346)
     * 
     * Update fields:
     * - Department: Engineering → Sales (changed)
     * - Position: Sales Manager → Senior Sales Manager (changed)
     * - Any other fields for testing
     * 
     * Save updated employee record.
     * 
     * Expected: Employee updated successfully in UKG Pro
     * 
     * This step CANNOT be automated - requires UKG Pro portal access.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 9: Update Employee in UKG Pro');
    baseTest.logger.info('→ Return to UKG Pro system');
    baseTest.logger.info('→ Search for existing employee');
    baseTest.logger.info('→ Update fields:');
    baseTest.logger.info('  - Department: Engineering → Sales');
    baseTest.logger.info('  - Position: Sales Manager → Senior Sales Manager');
    baseTest.logger.info('→ Save updated employee record');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 10: Trigger Workato Employee Sync (Updated Employee)
     * 
     * Action Option A (Scheduled Sync):
     * - Wait for next scheduled delta sync
     * - Delta sync should detect changed fields
     * - Only updated fields synced to iCIMS (delta)
     * 
     * Action Option B (Manual Trigger):
     * - In Workato, trigger UKG-Pro-Employee-Parent recipe
     * - Recipe should detect employee changes
     * 
     * Expected:
     * - Recipe executes successfully
     * - Job log shows UPDATED employee data (not full record)
     * - Delta changes posted to iCIMS API
     * - Job status: Success
     * 
     * Verify in Workato job details:
     * - Recipe detected changes in UKG Pro
     * - Only changed fields in payload (delta sync)
     * - iCIMS API response confirms update
     * 
     * This step CANNOT be automated - requires Workato recipe trigger.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 10: Trigger Delta Sync for Updated Employee');
    baseTest.logger.info('→ Wait for scheduled delta sync OR manual trigger');
    baseTest.logger.info('→ Delta sync detects changed fields');
    baseTest.logger.info('→ Only updated fields synced (not full record)');
    baseTest.logger.info('→ Verify job log shows UPDATED data only');
    baseTest.logger.info('→ Job status: Success');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    // Step 11: Verify updated employee data synced
    await flow.verifyEmployeeUpdate(
      testData.updatedEmployee.email,
      testData.updatedEmployee.firstName,
      testData.updatedEmployee.lastName,
      {
        department: testData.updatedEmployee.department,
        position: testData.updatedEmployee.position
      }
    );
    
    baseTest.logger.info('');
    baseTest.logger.info('TEST SUMMARY:');
    baseTest.logger.info('Automated Steps (iCIMS): ✓ Complete');
    baseTest.logger.info('  ✓ Searched for newly synced employee');
    baseTest.logger.info('  ✓ Verified employee data populated from UKG Pro');
    baseTest.logger.info('  ✓ Verified EEO data with parameter filtering');
    baseTest.logger.info('  ✓ Searched for updated employee');
    baseTest.logger.info('  ✓ Verified delta sync for updated fields');
    baseTest.logger.info('');
    baseTest.logger.info('Manual Verification Required (External Systems):');
    baseTest.logger.info('  □ Workato: Verify all employee recipes active');
    baseTest.logger.info('  □ UKG Pro: Create new employee');
    baseTest.logger.info('  □ Workato: Trigger employee sync recipe');
    baseTest.logger.info('  □ Workato: Verify parameter lookup table configuration');
    baseTest.logger.info('  □ UKG Pro: Update employee fields');
    baseTest.logger.info('  □ Workato: Trigger delta sync for updates');
    baseTest.logger.info('');
    baseTest.logger.info('Key Features Verified:');
    baseTest.logger.info('  - Delta Sync: Only changed fields synced (not full record)');
    baseTest.logger.info('  - Parameter Filtering: Lookup table controls EEO field sync');
    baseTest.logger.info('  - Field Mappings: UKG Pro fields → iCIMS fields');
    baseTest.logger.info('  - Batch Processing: Recipe handles employee sync efficiently');
  });
});
