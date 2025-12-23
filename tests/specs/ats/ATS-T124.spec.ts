import { test } from '@tests/governance';
import { RecruitingWorkflowFlow } from '@src/flows/ats/recruiting-workflow.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

test.describe('ATS Recruiting Workflow - Status Changes', () => {

  test('ATS-T124: Advance, Reject, and External Portal auto-launch', async ({
    baseTest,
    logger,
    testData,
    authPage,
  }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');

    const flow = new RecruitingWorkflowFlow(baseTest, page);

    // Steps 1-2: Navigate to Recruiting Workflow search and open first workflow
    await flow.navigateAndOpenWorkflow();

    // Steps 3-7: Advance to "Reviewed"
    await flow.advanceWorkflowStatus(testData.advanceStatus || 'Initial Review: Reviewed');

    // Steps 8-10: Verify on candidate profile
    await flow.verifyCandidateWorkflowStatus('Reviewed');

    // Steps 11-15: Reject to "Not Selected"
    await flow.rejectWorkflowStatus(testData.rejectStatus || 'Not Selected');

    // Steps 16-18: Verify rejection on candidate profile
    await flow.verifyCandidateWorkflowStatus('Not Selected');

    // Steps 19-31: External Portal with auto-launch wizard
    await flow.advanceWithAutoLaunch(testData);

    // Step 31: Cancel edit mode
    await flow.cancelEdit();
  });
});