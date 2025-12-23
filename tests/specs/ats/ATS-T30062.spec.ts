// tests/specs/ats/ATS-T30062.spec.ts
import { test } from '@tests/governance';
import { HiringAutomationFlow } from '@src/flows/ats/hiring-automation.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T30062: Hiring Automation - Send Text on Workflow Status Change
 * 
 * Test Case: When a User Admin creates a rule with a Status change trigger and a Send Text action,
 *            then a Recruiter moves a Candidate into that status to trigger it,
 *            the rule should trigger and the text should send
 * 
 * Objective: Verify that Hiring Automation rules can be created with a "Workflow Status Changed"
 *            trigger and "Send Text" action, and that the rule executes correctly when triggered
 * 
 * Prerequisites:
 * - Hiring Automation feature must be enabled (flagged on and config enabled)
 * - Text engagement must be config enabled
 * - 10DLC setup must be complete
 * - Status "Recruiter Reviewed- Move forward" must exist in "New Submissions" bin
 * - Bin "New Submissions" must not be "Hidden" or "Read only"
 * - User must have User Admin permissions
 * 
 * Test Flow:
 * 1. Login as User Admin/Recruiter
 * 2. Navigate to Admin > Hiring Automation
 * 3. Create a new automation rule with:
 *    - Trigger: Workflow Status Changed
 *    - Bin: New Submissions
 *    - Status: Recruiter Reviewed- Move forward
 *    - Action: Send Text
 *    - Body: Text with variables
 * 4. Navigate to Recruiting Workflow search
 * 5. Update candidate's phone number
 * 6. Change candidate's status to trigger the rule
 * 7. Wait ~3 minutes for rule to execute
 * 8. Verify rule invocation in Hiring Automation logs
 * 9. Verify text message appears in candidate's Text Engagement tab
 * 
 * IMPORTANT NOTE:
 * This test requires the Hiring Automation feature to be enabled on the environment.
 * If Hiring Automation is not available, the test will be skipped.
 */
test.describe('ATS-T30062: Hiring Automation - Send Text on Status Change', () => {
  test('ATS-T30062: Complete hiring automation send text workflow', async ({ baseTest, authPage, testData }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');

    // Login confirmation
    await baseTest.logger.section('Login as Recruiter', async () => {
        baseTest.logger.info('Authenticated as recruiter');
    });

    const flow = new HiringAutomationFlow(baseTest, page);

    // Navigate to Hiring Automation
    await flow.navigateToHiringAutomation();

    // Create automation rule
    await flow.createAutomationRule(testData);

    // Navigate to Recruiting Workflow search
    await flow.searchNav.navigateToSearch('Recruiting Workflow');
    await flow.workflowSearchPage.expectLoaded();

    // Open first candidate
    await flow.openFirstCandidate();

    // Update candidate phone number
    await flow.updateCandidatePhone(testData.phoneNumber);

    // Change status to trigger the automation rule
    await flow.changeStatusToTriggerRule(testData);

    // Wait for rule to execute (~3 minutes)
    await flow.waitForRuleExecution(testData.waitMinutes);

    // Verify rule invocation in logs
    await flow.verifyRuleInvocationInLogs(testData.automationName);

    // Verify text message in Text Engagement tab
    await flow.verifyTextMessageInTextEngagement(testData.expectedTextContent);

    // Manual verification step - log message for tester
    await baseTest.logger.info('===== MANUAL VERIFICATION REQUIRED =====');
    await baseTest.logger.info('Please check the test cellphone for a text message.');
    await baseTest.logger.info(`Expected text message content: "${testData.textBody}"`);
    await baseTest.logger.info('Verify variables are populated with correct candidate/job data.');
    await baseTest.logger.info('========================================');
  });
});
