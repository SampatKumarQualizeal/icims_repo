// tests/specs/hcmint/HCMINT-T67.spec.ts
import { test } from '@tests/governance';
import { ATSLoginFlow } from '@src/flows/ats/common/ats.login.flow';
import { config } from '@config/config';
import { ADPPrehireFlow } from '@src/flows/ats/hcm/adp-prehire.flow';

/**
 * HCMINT-T67: ADP-WFN Pre-hire Integration Test
 * 
 * This test validates ADP WFN Pre-hire Recipe E2E integration.
 * Tests that candidate values in iCIMS are properly sent to ADP vendor.
 * 
 * ⚠️  IMPORTANT: This is a PARTIAL AUTOMATION test
 * 
 * AUTOMATED (iCIMS):
 * - Create candidate via Navigator > People > Add Person
 * - Submit candidate to job/requisition
 * - Advance to Hired status
 * - Fill Employee Info with ADP-required fields
 * - Advance to HCM Connector Prehire status
 * 
 * MANUAL (External Systems):
 * - Step 1: Verify Workato recipes are active
 * - Step 6: Verify Workato recipe execution and payload
 * - Step 7: Verify candidate pre-hired in ADP with correct data
 * - Step 8: Verify Associate OID populated in iCIMS from ADP
 * 
 * Prerequisites:
 * - Workato recipes must be active:
 *   - ADP-Wfn-ApplicantOnboard-Parent
 *   - ADP-Wfn-ApplicantOnboard-Standard
 *   - ADP-Wfn-ApplicantOnboard-Custom
 *   - ADP-Wfn-HiredSendAdditionalInfo
 *   - ADP-Wfn-Prehire
 *   - ADP-Wfn-Rehire
 * 
 * Test Data:
 * - Candidate: HCMINT67 TestCandidate
 * - SSN: 518-26-7232
 * - DOB: 2000-05-10
 * - Hire Date: 2023-05-10
 * - ADP Pay Group: BOS
 * - Onboarding Template: 15336_7354
 * - Onboarding Experience: 416957D12DF04478
 * 
 * Integration Flow:
 * iCIMS (Prehire) → Workato (Recipe) → ADP WFN (Create Applicant)
 *                                    ↓
 *                    iCIMS ← (Associate OID)
 */
test.describe('HCMINT-T67: ADP WFN Pre-hire Integration', () => {
  test('HCMINT-T67: Pre-hire candidate and validate ADP integration', async ({ 
    baseTest, 
    testData 
  }) => {
    const page = baseTest.page;
    
    /**
     * MANUAL STEP 1: Verify Workato Recipes
     * 
     * Action: Login to Workato and navigate to:
     * ICIMS HCM Integrations > Standard Recipes > ADP WFN > Pre-hire
     * 
     * Verify all required recipes show status: Active
     * - ADP-Wfn-ApplicantOnboard-Parent
     * - ADP-Wfn-ApplicantOnboard-Standard
     * - ADP-Wfn-ApplicantOnboard-Custom
     * - ADP-Wfn-HiredSendAdditionalInfo
     * - ADP-Wfn-Prehire
     * - ADP-Wfn-Rehire
     * 
     * This step CANNOT be automated through browser as Workato requires
     * separate authentication and API access.
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 1: Verify Workato Recipes');
    baseTest.logger.info('→ Login to Workato');
    baseTest.logger.info('→ Navigate to: ICIMS HCM Integrations > Standard Recipes > ADP WFN > Pre-hire');
    baseTest.logger.info('→ Verify all 6 recipes show status: Active');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    // Login as recruiter
    const loginFlow = new ATSLoginFlow(page, baseTest.logger);
    const creds = config.secrets.ats.roleCredentials.recruiter;
    await loginFlow.login(
      { username: creds.username, password: creds.password },
      'ATS Recruiter User'
    );
    
    // Initialize flow
    const flow = new ADPPrehireFlow(baseTest, page);
    
    // Step 2: Create candidate in iCIMS
    await flow.createCandidate({
      firstName: testData.firstName,
      lastName: testData.lastName,
      email: testData.email,
      phone: testData.phone
    });
    
    // Step 3: Submit candidate to job/requisition
    await flow.submitToJob(testData.jobName);
    
    // Step 4: Advance candidate to Hired status
    await flow.advanceToHired();
    
    // Step 5: Fill Employee Info with ADP-required fields
    await flow.fillEmployeeInfo({
      hireDate: testData.hireDate,
      ssn: testData.ssn,
      dob: testData.dob,
      payGroup: testData.payGroup,
      onboardingTemplate: testData.onboardingTemplate,
      onboardingExperience: testData.onboardingExperience
    });
    
    // Step 6: Advance to HCM Connector Prehire status
    await flow.advanceToHCMConnectorPrehire();
    
    /**
     * MANUAL STEP 7: Verify Workato Recipe Execution
     * 
     * Action: Return to Workato dashboard
     * Navigate to: ICIMS HCM Integrations > Standard Recipes > ADP WFN > Pre-hire
     * 
     * Expected: 
     * - Check job history for recent execution
     * - Verify recipe ran successfully for this candidate
     * - Check execution logs for payload sent to ADP
     * - Verify all required fields are present in payload:
     *   {
     *     "country": "US",
     *     "applicantOnboarding": {
     *       "onboardingTemplateCode": { "code": "15336_7354" },
     *       "onboardingStatus": { "statusCode": { "code": "inprogress" } },
     *       "applicantWorkerProfile": {
     *         "hireDate": "2023-05-10",
     *         "hireReasonCode": { "code": "N" }
     *       },
     *       "applicantPersonalProfile": {
     *         "birthName": {
     *           "givenName": "HCMINT67",
     *           "familyName": "TestCandidate"
     *         },
     *         "birthDate": "2000-05-10",
     *         "governmentIDs": [
     *           { "nameCode": { "code": "SSN" }, "id": "518-26-7232" }
     *         ],
     *         "communication": {
     *           "emails": [{ "emailUri": "hcmint67.test@icims.com" }]
     *         }
     *       },
     *       "applicantPayrollProfile": {
     *         "payrollGroupCode": "BOS",
     *         "overtimeEligibilityIndicator": "true"
     *       },
     *       "preHireIndicator": "true",
     *       "onboardingExperienceCode": { "code": "416957D12DF04478" }
     *     }
     *   }
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 7: Verify Workato Recipe Execution');
    baseTest.logger.info('→ Return to Workato dashboard');
    baseTest.logger.info('→ Check job history for recent execution');
    baseTest.logger.info('→ Verify recipe ran successfully');
    baseTest.logger.info('→ Check execution logs for payload sent to ADP');
    baseTest.logger.info('→ Verify all candidate fields present in payload');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 8: Verify Candidate in ADP
     * 
     * Action: Login to ADP WFN system
     * Navigate to candidate/applicant onboarding section
     * 
     * Expected:
     * - Search for candidate by name: HCMINT67 TestCandidate
     * - Verify candidate appears with Pre-hire status
     * - Verify all data transferred correctly:
     *   - Personal Info: Name, DOB, SSN
     *   - Email: hcmint67.test@icims.com
     *   - Hire Date: 2023-05-10
     *   - Payroll Group: BOS
     *   - Onboarding Template: 15336_7354
     *   - Onboarding Experience: 416957D12DF04478
     *   - Pre-hire Indicator: true
     */
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 8: Verify Candidate in ADP');
    baseTest.logger.info('→ Login to ADP WFN system');
    baseTest.logger.info('→ Search for candidate: HCMINT67 TestCandidate');
    baseTest.logger.info('→ Verify Pre-hire status');
    baseTest.logger.info('→ Verify all data transferred correctly');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    /**
     * MANUAL STEP 9: Verify Associate OID updated in iCIMS
     * 
     * Action: Return to iCIMS candidate profile
     * Navigate to Employee Info tab
     * 
     * Expected:
     * - Check for "Employee ID" or "Associate OID" field
     * - Field should now be populated with value from ADP
     * - This confirms bi-directional sync between iCIMS and ADP
     */
    await flow.verifyEmployeeIdPopulated();
    
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    baseTest.logger.info('MANUAL STEP 9: Verify Associate OID in iCIMS');
    baseTest.logger.info('→ Check Employee Info tab for Employee ID/Associate OID');
    baseTest.logger.info('→ Field should be populated with ADP value');
    baseTest.logger.info('→ Confirms bi-directional sync');
    baseTest.logger.info('═══════════════════════════════════════════════════════');
    
    baseTest.logger.info('');
    baseTest.logger.info('TEST SUMMARY:');
    baseTest.logger.info('Automated Steps (iCIMS): ✓ Complete');
    baseTest.logger.info('  ✓ Created candidate with required information');
    baseTest.logger.info('  ✓ Submitted candidate to job/requisition');
    baseTest.logger.info('  ✓ Advanced candidate to Hired status');
    baseTest.logger.info('  ✓ Filled Employee Info with ADP-required fields');
    baseTest.logger.info('  ✓ Advanced candidate to HCM Connector Prehire status');
    baseTest.logger.info('');
    baseTest.logger.info('Manual Verification Required (External Systems):');
    baseTest.logger.info('  □ Workato: Verify recipe execution and payload');
    baseTest.logger.info('  □ ADP WFN: Verify candidate pre-hired with correct data');
    baseTest.logger.info('  □ iCIMS: Verify Associate OID populated from ADP response');
  });
});
