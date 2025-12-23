// src/pages/crm/resume-upload.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * ResumeUploadPage
 * CRM resume upload dialog for creating candidates from resume files
 */
export class ResumeUploadPage extends BasePage {
  readonly resumeUploadBtn: Button;
  readonly pageHeading: Div;
  readonly pipelineCombobox: Input;
  readonly fileInput: Input;
  readonly uploadBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Resume Upload Page');

    this.resumeUploadBtn = new Button(
      page,
      page.getByRole('button', { name: 'Resume upload' }),
      'Resume Upload Button'
    );

    this.pageHeading = new Div(
      page,
      page.getByRole('heading', { name: 'Resume upload' }),
      'Resume Upload Heading'
    );

    this.pipelineCombobox = new Input(
      page,
      page.getByRole('combobox', { name: 'Select Pipelines (optional)' }),
      'Pipeline Combobox'
    );

    this.fileInput = new Input(
      page,
      page.locator('input[type="file"]'),
      'File Input'
    );

    this.uploadBtn = new Button(
      page,
      page.getByRole('button', { name: 'Upload candidates' }),
      'Upload Candidates Button'
    );
  }

  async expectLoaded() {
    await this.section('Expect Resume Upload dialog loaded', async () => {
      await this.pageHeading.expectVisible();
    });
  }

  async clickResumeUpload() {
    await this.section('Click Resume Upload option', async () => {
      await this.resumeUploadBtn.click();
      await this.expectLoaded();
    });
  }

  async selectPipeline(pipelineName: string) {
    await this.section(`Select pipeline: ${pipelineName}`, async () => {
      await this.pipelineCombobox.fill(pipelineName);
      await this.page.waitForTimeout(500); // Wait for dropdown
      
      await this.page.getByRole('option', { name: pipelineName }).click();
    });
  }

  async uploadResume(filePath: string) {
    await this.section(`Upload resume: ${filePath}`, async () => {
      await this.page.setInputFiles('input[type="file"]', filePath);
      
      // Verify file appears in selected files
      const fileName = filePath.split(/[\\/]/).pop() || filePath;
      const fileText = new Div(
        this.page,
        this.page.getByText(fileName),
        'Selected File Name'
      );
      await fileText.expectVisible();
    });
  }

  async clickUpload() {
    await this.section('Click Upload Candidates', async () => {
      await this.uploadBtn.click();
      // Dialog should close after upload
      await this.page.waitForLoadState('networkidle');
    });
  }

  async waitForParsing(seconds: number = 15) {
    await this.section(`Wait ${seconds} seconds for resume parsing`, async () => {
      await this.page.waitForTimeout(seconds * 1000);
    });
  }
}
