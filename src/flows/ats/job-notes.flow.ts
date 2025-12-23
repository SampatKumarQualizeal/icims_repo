// src/flows/ats/job-notes.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { JobSearchPage } from '@src/pages/ats/search/job-search.page';
import { JobProfilePage } from '@src/pages/ats/job/job-profile.page';
import { JobNotesPage } from '@src/pages/ats/job/job-notes.page';
import { JobNoteFormPage } from '@src/pages/ats/job/job-note-form.page';
import { SearchNavigationService } from '@src/services/search-navigation.service';

/**
 * JobNotesFlow
 * Orchestrates job notes CRUD operations:
 * - Navigate to job profile and access Notes tab
 * - Create new notes with topic, date, and content
 * - View and verify note details
 * - Edit existing notes
 * - Delete notes and verify removal
 */
export class JobNotesFlow extends BaseFlow {
  readonly jobSearchPage: JobSearchPage;
  readonly jobProfilePage: JobProfilePage;
  readonly jobNotesPage: JobNotesPage;
  readonly searchNav: SearchNavigationService;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.jobSearchPage = new JobSearchPage(page);
    this.jobProfilePage = new JobProfilePage(page);
    this.jobNotesPage = new JobNotesPage(page);
    this.searchNav = new SearchNavigationService(page);
  }

  /**
   * Access Notes tab from job profile
   */
  async accessNotesTab() {
    await this.base.logger.section('Access Notes tab', async () => {
      await this.jobProfilePage.clickNotesTab();
      await this.jobNotesPage.expectLoaded();
    });
  }

  /**
   * Record the current note count
   */
  async recordNoteCount(): Promise<number> {
    let count = 0;
    await this.base.logger.section('Record current note count', async () => {
      // Get the Notes button text to extract count
      const notesBtn = this.jobNotesPage.notesCountBtn.locator;
      const text = await notesBtn.textContent();
      
      if (text?.includes('?')) {
        count = 0;
      } else {
        const match = text?.match(/Notes (\d+)/);
        count = match ? parseInt(match[1]) : 0;
      }
      
      await this.base.logger.info(`Current note count: ${count}`);
    });
    return count;
  }

  /**
   * Add a new note
   */
  async addNote(testData: { topic: string; date: string; content: string }) {
    await this.base.logger.section('Add new note', async () => {
      // Click Add Note button - opens new tab (TabManager auto-captures it)
      await this.jobNotesPage.clickAddNote();
      
      // Wait for TabManager to capture the new tab
      await this.base.tabs.waitForNewTab('Note Form');
      
      // Use page object factory pattern
      const noteFormPage = this.base.tabs.as(JobNoteFormPage, 'Note Form');
      await noteFormPage.expectLoaded();
      
      // Fill in the note form
      await noteFormPage.fillTopic(testData.topic);
      await noteFormPage.fillDate(testData.date);
      await noteFormPage.fillContent(testData.content);
      
      // Save the note
      await noteFormPage.clickSave();
      
      // Tab closes automatically, TabManager switches back to main
      await this.base.tabs.switchTo('Main Tab');
      
      // Verify Notes tab is still active
      await this.jobProfilePage.verifyNotesTabActive();
    });
  }

  /**
   * Verify note was created successfully
   */
  async verifyNoteCreated(topic: string, expectedCount: number) {
    await this.base.logger.section('Verify note was created', async () => {
      // Verify activity feed shows "Note Created"
      await this.jobNotesPage.verifyNoteCreatedActivity();
      
      // Verify note title appears in activity feed
      await this.jobNotesPage.verifyNoteTitle(topic);
      
      // Verify note count increased
      await this.jobNotesPage.verifyNoteCount(expectedCount);
    });
  }

  /**
   * Expand notes list and view note details
   */
  async viewNoteDetails(testData: { topic: string; content: string; date: string; author: string }) {
    await this.base.logger.section('View note details', async () => {
      // Expand the notes list
      await this.jobNotesPage.expandNotesList();
      
      // Verify note details are displayed
      await this.jobNotesPage.verifyNoteDetails(
        testData.topic,
        testData.content,
        testData.date,
        testData.author
      );
    });
  }

  /**
   * Edit an existing note
   */
  async editNote(
    currentTopic: string,
    updatedData: { topic: string; date: string; content: string }
  ) {
    await this.base.logger.section('Edit note', async () => {
      // Expand notes list if not already expanded
      await this.jobNotesPage.expandNotesList();
      
      // Click on the note entry to view details - opens new tab
      await this.jobNotesPage.clickNoteEntry(currentTopic);
      
      // Wait for TabManager to capture the new tab
      await this.base.tabs.waitForNewTab('Note Details');
      
      // Use page object factory pattern
      const noteFormPage = this.base.tabs.as(JobNoteFormPage, 'Note Details');
      
      // Verify Back button is visible (note details view)
      await noteFormPage.backBtn.expectVisible();
      
      // Click Edit button
      await noteFormPage.clickEdit();
      
      // Update the fields
      await noteFormPage.fillTopic(updatedData.topic);
      await noteFormPage.fillDate(updatedData.date);
      await noteFormPage.fillContent(updatedData.content);
      
      // Save the changes
      await noteFormPage.clickSave();
      
      // Click Back to return to notes list
      await noteFormPage.clickBack();
      
      // Tab will close, return to job profile
      await this.base.tabs.switchTo('Main Tab');
    });
  }

  /**
   * Verify note was edited successfully
   */
  async verifyNoteEdited(topic: string) {
    await this.base.logger.section('Verify note was edited', async () => {
      // Verify activity feed shows "Note Edited"
      await this.jobNotesPage.verifyNoteEditedActivity();
      
      // Verify updated note title appears in activity feed
      await this.jobNotesPage.verifyNoteTitle(topic);
      
      // Verify note appears in list with updated topic
      await this.jobNotesPage.expandNotesList();
      await this.jobNotesPage.verifyNoteInList(topic);
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(topic: string) {
    await this.base.logger.section('Delete note', async () => {
      // Expand notes list if not already expanded
      await this.jobNotesPage.expandNotesList();
      
      // Click on the note entry - opens new tab
      await this.jobNotesPage.clickNoteEntry(topic);
      
      // Wait for TabManager to capture the new tab
      await this.base.tabs.waitForNewTab('Note Details');
      
      // Use page object factory pattern
      const noteFormPage = this.base.tabs.as(JobNoteFormPage, 'Note Details');
      const noteTab = this.base.tabs.current;
      
      // Set up dialog handler for confirmation
      noteTab.once('dialog', async dialog => {
        await dialog.accept();
      });
      
      // Click Delete button
      await noteFormPage.clickDelete();
      
      // Tab will close, return to job profile
      await this.base.tabs.switchTo('Main Tab');
    });
  }

  /**
   * Verify note was deleted successfully
   */
  async verifyNoteDeleted(topic: string, expectedCount: number) {
    await this.base.logger.section('Verify note was deleted', async () => {
      // Verify note count decreased
      await this.jobNotesPage.verifyNoteCount(expectedCount);
      
      // Expand notes list and verify note is not present
      if (expectedCount > 0) {
        await this.jobNotesPage.expandNotesList();
      }
      await this.jobNotesPage.verifyNoteNotInList(topic);
    });
  }
}
