// tests/specs/ats/ATS-T30067.spec.ts
import { test } from '@tests/governance';
import { JobNotesFlow } from '@src/flows/ats/job-notes.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T30067: Job Notes CRUD Operations
 * 
 * Test Case: Given I am a recruiter, when I am viewing a job, then I should be able to add, edit, and delete notes
 * 
 * Objective: Verify that the notes tab on a job profile shows expected data and responds to user input accordingly
 * 
 * Prerequisites:
 * - User must be logged in as a recruiter with appropriate permissions
 * - A job profile must exist (follow steps in ICIMS-T33582 to create a job if needed)
 * 
 * Test Flow:
 * 1. Navigate to a job profile and access the Notes tab
 * 2. Record the initial note count (should be 0 for this test)
 * 3. Add a new note with specific test data (Topic, Date, Content)
 * 4. Verify the note was created successfully and the note count increased by 1
 * 5. View the note details to verify all fields are correct
 * 6. Edit the note with updated values for all fields
 * 7. Verify the note updates were applied correctly
 * 8. Delete the note and confirm deletion
 * 9. Verify the note was removed and count decreased back to original
 * 
 * Test Data:
 * - Initial Note: Topic="Note title", Date="1/1/2025 12:00 PM", Content="This is a test note"
 * - Updated Note: Topic="Note title EDITED", Date="2/2/2025 11:00 AM", Content="This is a test note EDITED"
 */
test.describe('ATS-T30067: Job Notes CRUD Operations', () => {
  test('ATS-T30067: Complete job notes CRUD workflow', async ({ baseTest, authPage, testData, tabs }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');

    // Login confirmation
    await baseTest.logger.section('Login as Recruiter', async () => {
        baseTest.logger.info('Authenticated as recruiter');
    });

    const flow = new JobNotesFlow(baseTest, page);

    // Navigate to job search
    await flow.jobSearchPage.navigateTo();
    await flow.jobSearchPage.expectLoaded();

    // Execute job search (default search shows all jobs)
    await flow.jobSearchPage.runSearch();

    // Open job profile
    await flow.searchNav.openProfileFromResults(testData.jobTitle, 'Job');
    await flow.jobProfilePage.expectLoaded();

    // Access Notes tab
    await flow.accessNotesTab();

    // Record initial note count
    const initialCount = await flow.recordNoteCount();

    // Add new note
    await flow.addNote({
      topic: testData.initialNote.topic,
      date: testData.initialNote.date,
      content: testData.initialNote.content
    });

    // Verify note was created
    await flow.verifyNoteCreated(testData.initialNote.topic, initialCount + 1);

    // View note details and verify all fields
    await flow.viewNoteDetails({
      topic: testData.initialNote.topic,
      content: testData.initialNote.content,
      date: testData.initialNote.date,
      author: testData.author
    });

    // Edit the note
    await flow.editNote(testData.initialNote.topic, {
      topic: testData.updatedNote.topic,
      date: testData.updatedNote.date,
      content: testData.updatedNote.content
    });

    // Verify note was edited
    await flow.verifyNoteEdited(testData.updatedNote.topic);

    // Delete the note
    await flow.deleteNote(testData.updatedNote.topic);

    // Verify note was deleted
    await flow.verifyNoteDeleted(testData.updatedNote.topic, initialCount);
  });
});
