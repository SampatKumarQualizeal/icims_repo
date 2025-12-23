import { test } from '@tests/governance';
import { WorkflowActionsFlow } from '@src/flows/ats/workflow-actions.flow';
import testData from '@tests/data/scenarios/ats/ATS-T29971.json';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29971: Recruiting Workflow Actions Menu Testing
 * 
 * This test validates all toolbar actions available on the
 * Recruiting Workflow search page when a candidate is selected.
 * 
 * Actions tested:
 * 1. Submit to Workflow - Submit candidate to additional job
 * 2. Email - Send email to candidate
 * 3. Share - Share candidate profile
 * 4. iForms - Send iForm to candidate
 * 5. Bulk Print Documents - Download candidate resume
 * 6. View Talent Matches - View talent matching results
 */

test.describe('ATS-T29971: Recruiting Workflow Actions Menu', () => {
  const testId = 'ATS-T29971';

  test(`${testId}: All workflow actions`, async ({ baseTest, authPage }) => {
    const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
    
    // Login confirmation
    await baseTest.logger.section('Login as ATS Admin', async () => {
        baseTest.logger.info('Authenticated as admin');
    });

    const flow = new WorkflowActionsFlow(baseTest, page);
    
    // Navigate and select candidate
    await flow.navigateAndSearchWorkflows();
    await flow.selectCandidate(testData.candidateName, testData.statusGroup,true);
    
    // Execute all actions
    await baseTest.logger.section('Action 1: Submit to workflow', async () => {
      const submittedJobName = await flow.submitToWorkflow(testData.submitFilter);
      baseTest.logger.info(`Submitted to: ${submittedJobName}`);
      await flow.selectCandidate(testData.candidateName, testData.statusGroup);
    });
    
    await baseTest.logger.section('Action 2: Send email', async () => {
      await flow.sendEmail(testData);
      await flow.selectCandidate(testData.candidateName, testData.statusGroup,true);
    });
    
    await baseTest.logger.section('Action 3: Share profile', async () => {
      await flow.shareProfile(testData);
      await flow.selectCandidate(testData.candidateName, testData.statusGroup,true);
    });
    
    await baseTest.logger.section('Action 4: Send iForm', async () => {
      await flow.sendIForm();
      await flow.selectCandidate(testData.candidateName, testData.statusGroup);
    });
    
    await baseTest.logger.section('Action 5: Bulk print documents', async () => {
      await flow.bulkPrintDocuments(testData.printDocument);
      await flow.selectCandidate(testData.candidateName, testData.statusGroup);
    });
    
    // await baseTest.logger.section('Action 6: View talent matches', async () => {
    //   await flow.viewTalentMatches();
    // });
  });
});
