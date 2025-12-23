// src/flows/ats/workflow-actions.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { RecruitingWorkflowSearchPage } from '@src/pages/ats/workflow/recruiting-workflow-search.page';
import { SubmitToWorkflowPopup } from '@src/pages/ats/workflow/submit-to-workflow.popup';
import { ComposeEmailPage } from '@src/pages/ats/compose-email.page';
import { ShareDialogPage } from '@src/pages/ats/share-dialog.page';
import { BulkPrintDocumentsPage } from '@src/pages/ats/bulk-print-documents.page';

/**
 * WorkflowActionsFlow
 * Orchestrates recruiting workflow toolbar actions:
 * - Submit to Workflow
 * - Email
 * - Share
 * - iForms
 * - Bulk Print Documents (More menu)
 * - View Talent Matches (More menu)
 */
export class WorkflowActionsFlow extends BaseFlow {
  readonly searchPage: RecruitingWorkflowSearchPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.searchPage = new RecruitingWorkflowSearchPage(page);
  }

  async navigateAndSearchWorkflows() {
    await this.base.logger.section('Navigate to Recruiting Workflow search', async () => {
      await this.searchPage.navigateToSearch();
      await this.searchPage.expectLoaded();
      await this.searchPage.runSearch();
    });
  }

  async selectCandidate(candidateName: string, statusGroup?: string, expandGroup: boolean = false) {
    await this.base.logger.section(`Select candidate: ${candidateName}`, async () => {
      // Expand status groups if specified
      if (statusGroup && expandGroup) {
        await this.searchPage.expandGroup('Bin: New Submissions', statusGroup);
        //await this.searchPage.expandGroup(`Status: ${statusGroup}`);
      }

      await this.searchPage.selectCandidateRow(candidateName);
      await this.searchPage.verifyToolbarEnabled();
    });
  }

  async submitToWorkflow(
    filterOption: string = 'All open jobs'): Promise<string> {
    let submittedJobName = '';

    await this.base.logger.section('Submit candidate to additional workflow', async () => {
      // Click the "More" button to ensure the menu is open
      await this.searchPage.clickMoreButton();

      // Get the locator for the button that opens the popup
      const submitButton = this.searchPage.getSubmitToWorkflowButton();

      // Use openPopupByClick to handle the popup
      await this.base.tabs.openPopupByClick(
        this.page,
        submitButton,
        'Submit to Workflow'
      );

      // Use page object factory pattern
      const submitPopup = this.base.tabs.as(SubmitToWorkflowPopup, 'Submit to Workflow');
      await submitPopup.expectLoaded();
      // Select filter
      await submitPopup.selectFilter(filterOption);

      // Select first job by double-clicking
      await submitPopup.selectFirstJob();

      // Get the job name for verification
      submittedJobName = await submitPopup.getSelectedJobName();

      // Submit
      await submitPopup.submit();
      //await submitPopup.verifySuccess();

      // Close tab and switch back
      await this.base.tabs.close('Submit to Workflow');
      await this.base.tabs.switchTo('Main Tab');
    });

    return submittedJobName;
  }

  async sendEmail(testData: any) {
    await this.base.logger.section('Send email to candidate', async () => {
      await this.searchPage.clickEmail();
      // Wait for TabManager to capture the compose email tab
      await this.base.tabs.waitForNewTab('Compose Email');
      // Use page object factory pattern
      const emailPage = this.base.tabs.as(ComposeEmailPage, 'Compose Email');
      await emailPage.expectLoaded();

      // Verify recipient
      if (testData.candidateName) {
        await emailPage.verifyRecipient(testData.candidateName);
      }

      // Fill email details
      await emailPage.fillSubject(testData.emailSubject);
      await emailPage.fillBody(testData.emailBody);

      // Send
      await emailPage.send();

      // Tab should close automatically, switch back to main
      await this.base.tabs.switchTo('Main Tab');
    });
  }

  async shareProfile(testData: any) {
    await this.base.logger.section('Share candidate profile', async () => {
      await this.searchPage.clickShare();

      // Wait for TabManager to capture the share tab
      await this.base.tabs.waitForNewTab('Share Profile');

      // Use page object factory pattern
      const sharePage = this.base.tabs.as(ShareDialogPage, 'Share Profile');
      await sharePage.expectLoaded();

      // Fill share details
      await sharePage.fillTo(testData.shareTo || 'iAdmin');
      await sharePage.fillSubject(testData.shareSubject);
      await sharePage.fillMessage(testData.shareBody);

      // Send
      await sharePage.send();

      // Tab should close automatically, switch back to main
      await this.base.tabs.switchTo('Main Tab');
    });
  }

  async sendIForm() {
    await this.base.logger.section('Send iForm to candidate', async () => {
      const iframe = this.page.frameLocator('[data-testid="main-body-iframe"]');

      // Step 2: Click iForms (opens page2)
      const page2Promise = this.page.waitForEvent('popup');
      await iframe.getByRole('button', { name: ' iForms' }).click();
      const page2 = await page2Promise;

      // Step 4: Click Send iForm (opens page3)
      const page3Promise = page2.waitForEvent('popup');
      await page2.getByRole('button', { name: ' Send iForm' }).click();
      const page3 = await page3Promise;

      // Step 5: Continue and Send
      await page3.waitForLoadState();
      await page3.getByRole('button', { name: 'Continue' }).click();
      await page3.getByRole('button', { name: 'Send' }).click();

      // Wait for completion
      await page3.waitForLoadState();

      // Close tabs and return to main
      
      await page2.close();
      await this.base.tabs.switchTo('Main Tab');
    });
  }

  async bulkPrintDocuments(documentName: string = 'Resume') {
    await this.base.logger.section('Bulk print candidate documents', async () => {
      await this.searchPage.clickMoreMenuItem('Bulk Print Documents');

      // Wait for TabManager to capture the bulk print tab
      await this.base.tabs.waitForNewTab('Bulk Print');

      // Use page object factory pattern
      const bulkPrintPage = this.base.tabs.as(BulkPrintDocumentsPage, 'Bulk Print');
      await bulkPrintPage.expectLoaded();

      // Select document
      await bulkPrintPage.selectDocument(documentName);
      await bulkPrintPage.verifyDocumentSelected(documentName);

      // Click Bulk Print
      await bulkPrintPage.clickBulkPrint();

      // Wait for processing
      await bulkPrintPage.waitForProcessing();

      // Download file
      const download = await bulkPrintPage.download();

      // Verify download
      const filename = await download.suggestedFilename();
      this.base.logger.info(`Downloaded file: ${filename}`);

      // // Wait for TabManager to capture the summary tab
      // await this.base.tabs.waitForNewTab('Print Summary');

      // // Close both tabs and switch back
      // await this.base.tabs.close('Print Summary');
      await this.base.tabs.close('Bulk Print');
      await this.base.tabs.switchTo('Main Tab');
    });
  }

  async viewTalentMatches() {
    await this.base.logger.section('View talent matches', async () => {
      await this.searchPage.clickMoreMenuItem('View Talent Matches');

      // Wait for page to load talent matches in current tab
      await this.page.waitForLoadState('networkidle');

      // TODO: Create TalentMatchesPage if more verification is needed
      // Verify talent matches heading appears in iframe
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      await mainFrame.getByRole('heading', { name: /Talent Match/i }).waitFor({
        state: 'visible',
        timeout: 10000
      });
    });
  }
}
