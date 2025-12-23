// src/pages/ats/job-notes.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * JobNotesPage
 * Represents the Notes tab on a job profile
 * Displays notes list and provides access to add/edit/delete notes
 * Note: Notes content is in iframe[name="target_frame_left"] inside main-body-iframe
 */
export class JobNotesPage extends BasePage {
  protected notesFrame?: FrameLocator;
  readonly addNoteBtn: Button;
  readonly notesCountBtn: Button;
  readonly noteCreatedActivity: Div;
  readonly noteEditedActivity: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe contexts
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const notesFrame = mainFrame.frameLocator('iframe[name="target_frame_left"]');
    
    // STEP 2: Call super
    super(page, notesFrame.locator('body'), 'Job Notes Page');
    
    // STEP 3: Store frameLocator
    this.notesFrame = notesFrame;
    
    // STEP 4: Instantiate components
    this.addNoteBtn = new Button(
      page,
      notesFrame.getByRole('button', { name: 'Add Note', exact: true }),
      'Add Note Button'
    );
    
    this.notesCountBtn = new Button(
      page,
      notesFrame.locator('button:has-text("Notes")'),
      'Notes Count Button'
    );
    
    // Activity feed items in main frame
    this.noteCreatedActivity = new Div(
      page,
      mainFrame.getByText('Note Created'),
      'Note Created Activity'
    );
    
    this.noteEditedActivity = new Div(
      page,
      mainFrame.getByText('Note Edited'),
      'Note Edited Activity'
    );
  }

  async expectLoaded() {
    await this.section('Job Notes - verify loaded', async () => {
      await this.addNoteBtn.expectVisible();
    });
  }

  async clickAddNote() {
    await this.section('Click Add Note button', async () => {
      await this.addNoteBtn.click();
    });
  }

  async expandNotesList() {
    await this.section('Expand notes list', async () => {
      await this.notesCountBtn.click();
      await this.page.waitForTimeout(500);
    });
  }

  async verifyNoteCount(expectedCount: number) {
    await this.section(`Verify note count: ${expectedCount}`, async () => {
      const countText = expectedCount === 0 ? '?' : expectedCount.toString();
      const countBtn = new Button(
        this.page,
        this.notesFrame!.locator(`button:has-text("Notes ${countText}")`),
        `Notes Count: ${countText}`
      );
      await countBtn.expectVisible();
    });
  }

  async verifyNoteCreatedActivity() {
    await this.section('Verify Note Created activity', async () => {
      await this.noteCreatedActivity.expectVisible();
    });
  }

  async verifyNoteEditedActivity() {
    await this.section('Verify Note Edited activity', async () => {
      await this.noteEditedActivity.expectVisible();
    });
  }

  async verifyNoteInList(topic: string) {
    await this.section(`Verify note in list: ${topic}`, async () => {
      const noteDiv = new Div(
        this.page,
        this.notesFrame!.getByText(topic),
        `Note Topic: ${topic}`
      );
      await noteDiv.expectVisible();
    });
  }

  async verifyNoteDetails(topic: string, content: string, date: string, author: string) {
    await this.section('Verify note details', async () => {
      const topicDiv = new Div(
        this.page,
        this.notesFrame!.getByText(topic),
        `Note Topic: ${topic}`
      );
      await topicDiv.expectVisible();
      
      const contentDiv = new Div(
        this.page,
        this.notesFrame!.getByText(content),
        `Note Content: ${content}`
      );
      await contentDiv.expectVisible();
      
      const dateDiv = new Div(
        this.page,
        this.notesFrame!.getByText(date),
        `Note Date: ${date}`
      );
      await dateDiv.expectVisible();
      
      const authorDiv = new Div(
        this.page,
        this.notesFrame!.getByText(author),
        `Note Author: ${author}`
      );
      await authorDiv.expectVisible();
    });
  }

  async clickNoteEntry(topic: string) {
    await this.section(`Click note entry: ${topic}`, async () => {
      const noteLink = new Div(
        this.page,
        this.notesFrame!.getByText(topic),
        `Note Entry: ${topic}`
      );
      await noteLink.click();
      await this.page.waitForTimeout(500);
    });
  }

  async verifyNoteNotInList(topic: string) {
    await this.section(`Verify note not in list: ${topic}`, async () => {
      const noteDiv = new Div(
        this.page,
        this.notesFrame!.getByText(topic),
        `Note Topic: ${topic}`
      );
      await noteDiv.verifyNotExists();
    });
  }

  async verifyNoteTitle(topic: string) {
    await this.section(`Verify note title in activity: ${topic}`, async () => {
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const noteTitle = new Div(
        this.page,
        mainFrame.getByText(`Note: "${topic}"`),
        `Note Title: ${topic}`
      );
      await noteTitle.expectVisible();
    });
  }
}
