// src/pages/ats/job-note-form.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

/**
 * JobNoteFormPage
 * Represents the note creation/edit form that opens in a new browser tab
 * Form contains: Topic, Date, Content (vNotes) fields
 */
export class JobNoteFormPage extends BasePage {
  readonly topicInput: Input;
  readonly dateInput: Input;
  readonly contentInput: Input;
  readonly saveBtn: Button;
  readonly deleteBtn: Button;
  readonly backBtn: Button;
  readonly editBtn: Button;

  constructor(page: Page) {
    // STEP 1: No iframe - form is in main page context
    // STEP 2: Call super
    super(page, page.locator('body'), 'Job Note Form Page');
    
    // STEP 3: N/A - no frame
    
    // STEP 4: Instantiate components
    this.topicInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Topic' }),
      'Topic Input'
    );
    
    this.dateInput = new Input(
      page,
      page.getByRole('textbox', { name: 'Date' }),
      'Date Input'
    );
    
    this.contentInput = new Input(
      page,
      page.locator('#vNotes'),
      'Content Input'
    );
    
    this.saveBtn = new Button(
      page,
      page.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.deleteBtn = new Button(
      page,
      page.getByRole('button', { name: 'Delete' }),
      'Delete Button'
    );
    
    this.backBtn = new Button(
      page,
      page.getByRole('button', { name: 'Back' }),
      'Back Button'
    );
    
    this.editBtn = new Button(
      page,
      page.getByRole('button', { name: 'Edit' }),
      'Edit Button'
    );
  }

  async expectLoaded() {
    await this.section('Job Note Form - verify loaded', async () => {
      await this.topicInput.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  async fillTopic(topic: string) {
    await this.section(`Fill topic: ${topic}`, async () => {
      await this.topicInput.fill(topic);
    });
  }

  async fillDate(date: string) {
    await this.section(`Fill date: ${date}`, async () => {
      await this.dateInput.fill(date);
    });
  }

  async fillContent(content: string) {
    await this.section(`Fill content: ${content}`, async () => {
      await this.contentInput.fill(content);
    });
  }

  async clickSave() {
    await this.section('Save note', async () => {
      await this.saveBtn.click();
      await this.page.waitForTimeout(2000);
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
      await this.saveBtn.expectVisible();
    });
  }

  async clickBack() {
    await this.section('Click Back button', async () => {
      await this.backBtn.click();
    });
  }

  async clickDelete() {
    await this.section('Delete note', async () => {
      await this.deleteBtn.click();
    });
  }

  async confirmDeletion() {
    await this.section('Confirm deletion', async () => {
      // Handle browser dialog
      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });
    });
  }
}
