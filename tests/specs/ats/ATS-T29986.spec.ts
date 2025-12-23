// tests/specs/ats/ATS-T29986.spec.ts
import { test } from '@tests/governance';
import { JobApprovalFlow } from '@src/flows/ats/job-approval.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29986: Job Approval Workflow Management
 * 
 * Test Case: Given I am a recruiter, when I am viewing a job profile,
 *            then I should be able to add and edit approvals
 * 
 * Objective: Ensure that the approvals tab shows expected content and
 *            approval functionality works correctly through all status transitions
 * 
 * Prerequisites:
 * - Job in Pending Approval status (ref: ATS-T142)
 * - Approver users configured in system
 * - Job title: "Blank" (or as specified in test data)
 * 
 * Key Status Transitions:
 * - Pending → Notified (when approval process begins)
 * - Notified → Approved (when approver approves)
 * - Folder status: "Pending Approval" → "Approved"
 * 
 * Test Flow:
 * 1. Navigate to job in Pending Approval status
 * 2. Access Approval tab
 * 3. Enter Edit mode and verify dropdown interface
 * 4. Manage approver status (from Notified to Approved)
 * 5. Save changes and verify completion
 * 6. Verify approval widget, date, and folder status changes
 */
test.describe('ATS-T29986: Job Approval Workflow Management', () => {
  test('ATS-T29986: Complete job approval workflow', async ({ baseTest, authPage, testData }) => {
    const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
    
    // Login confirmation
    await baseTest.logger.section('Login as Recruiter', async () => {
        baseTest.logger.info('Authenticated as admin');
    });

    // Initialize flow
    const approvalFlow = new JobApprovalFlow(baseTest, page);

    // Navigate to Job Search
    await approvalFlow.searchNav.navigateToSearch('Job', 'Job Search');
    await approvalFlow.jobSearchPage.expectLoaded();

    // Execute job search
    await approvalFlow.jobSearchPage.runSearch();
    await approvalFlow.searchNav.verifySearchResultsLoaded('Job');

    // Open job profile
    await approvalFlow.searchNav.openProfileFromResults(testData.jobTitle, 'Job');
    await approvalFlow.jobProfilePage.expectLoaded();

    // Verify job is in Pending Approval status
    await approvalFlow.verifyPendingApprovalStatus();

    // Access Approval tab
    await approvalFlow.accessApprovalTab();

    // Enter edit mode
    await approvalFlow.enterEditMode();

    // Verify approver details
    await approvalFlow.verifyApproverDetails(
      testData.approverName,
      testData.approverEmail
    );

    // Verify current status is "Notified"
    await approvalFlow.verifyCurrentStatus(testData.currentStatus);

    // Update approver status to "Approved"
    await approvalFlow.updateApproverStatus(testData.newStatus);

    // Save approval changes
    await approvalFlow.saveApprovalChanges();

    // Verify approval completion
    await approvalFlow.verifyApprovalCompletion();

    // Verify approver status in read-only view
    await approvalFlow.verifyApproverStatusReadOnly(testData.newStatus);

    // Navigate to People tab and verify status changes
    await approvalFlow.verifyStatusChangesOnPeopleTab(testData.expectedFolderStatus);

    // Verify progress indicator
    await approvalFlow.verifyProgressIndicator();

    // Navigate to Overview tab and verify approval
    await approvalFlow.verifyApprovalOnOverviewTab();
  });
});
