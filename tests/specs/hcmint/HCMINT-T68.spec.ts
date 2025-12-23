// tests/specs/hcmint/HCMINT-T68.spec.ts
import { test } from '@tests/governance';
import { ATSLoginFlow } from '@src/flows/ats/common/ats.login.flow';
import { config } from '@config/config';
import { ADPRehireFlow } from '@src/flows/ats/hcm/adp-rehire.flow';

/**
 * HCMINT-T68: ADP-WFN Rehire Integration Test
 * 
 * This test validates ADP WFN Rehire Recipe E2E integration.
 * Tests that terminated employee values in iCIMS are sent to ADP vendor during rehire.
 * 
 * ⚠️  IMPORTANT: This is a PARTIAL AUTOMATION test
 * 
 * AUTOMATED (iCIMS):
 * - Search for terminated employee via Quick Search
 * - Verify Employee Info contains associateOID (from previous hire)
 * - Submit candidate to job/requisition
 * - Advance to Hired status
 * - Update Employee Info with rehire date
 * - Advance to HCM Connector Prehire (triggers Rehire recipe)
 * 
 * MANUAL (External Systems):
 * - Step 1: Verify Workato recipes are active
 * - Step 2: Prepare terminated employee in ADP (if needed)
 * - Step 7: Verify Workato Rehire recipe execution and payload
 * - Step 8: Verify worker rehired in ADP with correct status
 * - Step 9: Verify associateOID unchanged in iCIMS
 * 
 * Prerequisites:
 * - Workato recipes must be active (especially ADP-Wfn-Rehire)
 * - Terminated employee must exist in both ADP and iCIMS
 * - Employee must have associateOID from previous hire
 * - If no terminated employee exists, create one in ADP and wait 24+ hours for sync
 * 
 * Key Difference from Prehire (T67):
 * - Prehire: Creates NEW worker in ADP (no associateOID)
 * - Rehire: Updates EXISTING terminated worker (has associateOID)
 * - Recipe routing based on associateOID presence
 * 
 * Test Data:
 * - Employee: HCMINT68 Rehire
 * - Associate OID: G3RV482D9ECNK45J (from previous ADP employment)
 * - Rehire Date: 2023-05-09
 * - Reason Code: 02 (rehire)
 * 
 * Integration Flow:
 * iCIMS (Prehire action) → Workato detects associateOID
 *                       ↓
 *              Routes to Rehire recipe
 *                       ↓
 *           ADP WFN (Update Worker: Terminated → Active)
 */
test.describe('HCMINT-T68: ADP WFN Rehire Integration', () => {
  test('HCMINT-T68: Rehire terminated employee and validate ADP integration', async ({ 
    baseTest, 
    testData 
  }) => {
    const page = baseTest.page;
    
    /**
     * MANUAL STEP 1: Verify Workato Recipes
     * 
     * Action: Login to Workato and navigate to:
     * ICIMS HCM Integrations > Standard Recipes > ADP WFN > Rehire
     * 
     * Verify all required recipes show status: Active
     * - ADP-Wfn-ApplicantOnboard-Parent
     * - ADP-Wfn-ApplicantOnboard-Standard
     * - ADP-Wfn-ApplicantOnboard-Custom
     * - ADP-Wfn-HiredSendAdditionalInfo
     * - ADP-Wfn-Prehire
     * - ADP-Wfn-Rehire (CRITICAL for this test)
     * 
     * This step CANNOT be automated through browser as Workato requires
     * separate authentication and API access.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 1: Verify Workato Recipes');
    baseTest.logger.info('→ Login to Workato');
    baseTest.logger.info('→ Navigate to: ICIMS HCM Integrations > Standard Recipes > ADP WFN > Rehire');
    baseTest.logger.info('→ Verify all 6 recipes show status: Active');
    baseTest.logger.info('→ CRITICAL: ADP-Wfn-Rehire must be active');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 2: Prepare Terminated Employee
     * 
     * Action Option A (if no terminated employee exists):
     * 1. Login to ADP WFN
     * 2. Search for currently employed worker
     * 3. Terminate the worker in ADP
     * 4. Wait at least 24 hours for termination to sync to iCIMS
     * 5. Verify termination imported to iCIMS
     * 
     * Action Option B (if terminated employee exists):
     * 1. Login to ADP WFN
     * 2. Search for terminated worker
     * 3. Note the associateOID (employee ID)
     * 4. Verify worker exists in iCIMS with terminated status
     * 
     * Expected in iCIMS:
     * - Candidate exists with Employee Info
     * - Associate OID populated with ADP employee ID
     * - Employment status: Terminated
     * 
     * This step CANNOT be automated - requires ADP portal access and
     * potential 24-hour sync delay.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 2: Prepare Terminated Employee');
    baseTest.logger.info('→ Option A: Terminate worker in ADP, wait 24+ hours for sync');
    baseTest.logger.info('→ Option B: Use existing terminated employee');
    baseTest.logger.info('→ Verify employee exists in iCIMS with associateOID');
    baseTest.logger.info('→ Verify employment status: Terminated');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    // Login as recruiter
    const loginFlow = new ATSLoginFlow(page, baseTest.logger);
    const creds = config.secrets.ats.roleCredentials.recruiter;
    await loginFlow.login(
      { username: creds.username, password: creds.password },
      'ATS Recruiter User'
    );
    
    // Initialize flow
    const flow = new ADPRehireFlow(baseTest, page);
    
    // Step 3: Search for terminated employee in iCIMS
    await flow.searchForTerminatedEmployee(
      testData.employeeFirstName,
      testData.employeeLastName
    );
    
    // Step 4: Verify Employee Info contains associateOID
    await flow.verifyAssociateOIDExists();
    
    // Step 5: Submit candidate to job/requisition
    await flow.submitToJob(testData.jobName);
    
    // Step 6: Advance candidate to Hired status
    await flow.advanceToHired();
    
    // Step 7: Update Employee Info with rehire date
    await flow.updateEmployeeInfoForRehire({
      rehireDate: testData.rehireDate,
      ssn: testData.ssn,
      dob: testData.dob,
      payGroup: testData.payGroup,
      onboardingTemplate: testData.onboardingTemplate,
      onboardingExperience: testData.onboardingExperience
    });
    
    // Step 8: Advance to HCM Connector Prehire (triggers Rehire recipe)
    await flow.advanceToHCMConnectorPrehire();
    
    /**
     * MANUAL STEP 9: Verify Workato Rehire Recipe Execution
     * 
     * Action: Return to Workato dashboard
     * Navigate to: ICIMS HCM Integrations > Standard Recipes > ADP WFN > Rehire
     * 
     * Expected:
     * - Check job history for recent execution
     * - Verify ADP-Wfn-Rehire recipe ran (NOT ADP-Wfn-Prehire)
     * - Check execution logs for rehire payload
     * - Verify payload contains:
     *   {
     *     "events": [{
     *       "data": {
     *         "transform": {
     *           "effectiveDateTime": "2023-05-09",
     *           "worker": {
     *             "workerDates": {
     *               "rehireDate": "2023-05-09"
     *             },
     *             "associateOID": "G3RV482D9ECNK45J",
     *             "workerStatus": {
     *               "reasonCode": {
     *                 "codeValue": "02"
     *               }
     *             }
     *           }
     *         }
     *       }
     *     }]
     *   }
     * 
     * Key Difference from Prehire:
     * - Prehire payload: Full applicantOnboarding object (creates new worker)
     * - Rehire payload: Worker transform with associateOID (updates existing worker)
     * - Recipe routes based on associateOID presence in iCIMS
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 9: Verify Workato Rehire Recipe Execution');
    baseTest.logger.info('→ Return to Workato dashboard');
    baseTest.logger.info('→ Check job history for recent execution');
    baseTest.logger.info('→ Verify ADP-Wfn-Rehire recipe ran (NOT Prehire)');
    baseTest.logger.info('→ Check execution logs for rehire payload');
    baseTest.logger.info('→ Verify payload contains:');
    baseTest.logger.info('  - effectiveDateTime: 2023-05-09');
    baseTest.logger.info('  - worker.associateOID: G3RV482D9ECNK45J');
    baseTest.logger.info('  - worker.workerDates.rehireDate: 2023-05-09');
    baseTest.logger.info('  - worker.workerStatus.reasonCode: 02');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 10: Verify Worker Rehired in ADP
     * 
     * Action: Login to ADP WFN system
     * Search for worker by associateOID or name
     * 
     * Expected:
     * - Worker status changed from "Terminated" to "Active"
     * - Rehire date updated: 2023-05-09
     * - Worker dates show rehireDate field populated
     * - Original hire date preserved (from first employment)
     * - Reason code shows "02" (rehire)
     * - Worker NOT duplicated (same associateOID)
     * - Employment history shows termination + rehire
     * 
     * Key Validation Points:
     * - Same associateOID (not new worker)
     * - Status change: Terminated → Active
     * - Rehire date matches iCIMS value
     * - Employment history continuity preserved
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 10: Verify Worker Rehired in ADP');
    baseTest.logger.info('→ Login to ADP WFN system');
    baseTest.logger.info('→ Search for worker by associateOID: G3RV482D9ECNK45J');
    baseTest.logger.info('→ Verify status: Terminated → Active');
    baseTest.logger.info('→ Verify rehire date: 2023-05-09');
    baseTest.logger.info('→ Verify worker NOT duplicated');
    baseTest.logger.info('→ Verify employment history shows termination + rehire');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * Step 11: Verify associateOID unchanged in iCIMS
     */
    await flow.verifyAssociateOIDUnchanged(testData.associateOID);
    
    baseTest.logger.info('');
    baseTest.logger.info('TEST SUMMARY:');
    baseTest.logger.info('Automated Steps (iCIMS): ✓ Complete');
    baseTest.logger.info('  ✓ Searched for terminated employee via Quick Search');
    baseTest.logger.info('  ✓ Verified Employee Info contains associateOID');
    baseTest.logger.info('  ✓ Submitted candidate to job/requisition');
    baseTest.logger.info('  ✓ Advanced candidate to Hired status');
    baseTest.logger.info('  ✓ Updated Employee Info with rehire date');
    baseTest.logger.info('  ✓ Advanced to HCM Connector Prehire (triggered Rehire recipe)');
    baseTest.logger.info('');
    baseTest.logger.info('Manual Verification Required (External Systems):');
    baseTest.logger.info('  □ Workato: Verify ADP-Wfn-Rehire recipe executed');
    baseTest.logger.info('  □ Workato: Verify rehire payload with associateOID');
    baseTest.logger.info('  □ ADP WFN: Verify worker status changed to Active');
    baseTest.logger.info('  □ ADP WFN: Verify rehire date updated');
    baseTest.logger.info('  □ iCIMS: Verify associateOID unchanged (same worker)');
    baseTest.logger.info('');
    baseTest.logger.info('Key Difference from Prehire (HCMINT-T67):');
    baseTest.logger.info('  - Prehire: Creates NEW worker, no associateOID → ADP-Wfn-Prehire recipe');
    baseTest.logger.info('  - Rehire: Updates EXISTING worker, has associateOID → ADP-Wfn-Rehire recipe');
    baseTest.logger.info('  - Recipe routing: System checks for associateOID presence');
  });
});
