// src/pages/ats/bulk-print-documents.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';

/**
 * BulkPrintDocumentsPage
 * Bulk print documents selection and download page
 * Opens in new tab when Bulk Print Documents is selected from More menu
 */
export class BulkPrintDocumentsPage extends BasePage {
  readonly bulkPrintBtn: Button;
  readonly closeBtn: Button;
  readonly downloadBtn: Link;
  readonly availableListbox: Div;
  readonly selectedListbox: Div;
  readonly progressBar: Div;
  readonly errorAlert: Div;

  constructor(page: Page) {
    // STEP 1: Bulk print page is main page
    super(page, page.locator('body'), 'Bulk Print Documents Page');
    
    // STEP 4: Instantiate components
    this.bulkPrintBtn = new Button(page,
      page.getByRole('button', { name: 'Bulk Print' }),
      'Bulk Print Button'
    );
    
    this.closeBtn = new Button(page,
      page.getByRole('button', { name: /Close/i }),
      'Close Button'
    );
    
    this.downloadBtn = new Link(page,
      page.getByRole('link', { name: 'Download File' }),
      'Download File Button'
    );
    
    this.availableListbox = new Div(page,
      page.getByRole('listbox', { name: 'Available' }),
      'Available Listbox'
    );
    
    this.selectedListbox = new Div(page,
      page.getByRole('listbox', { name: 'Selected' }),
      'Selected Listbox'
    );
    
    this.progressBar = new Div(page,
      page.getByRole('progressbar'),
      'Progress Bar'
    );

    this.errorAlert = new Div(page,
      page.getByRole('alert'),
      'Error Alert'
    );
  }

  async expectLoaded() {
    await this.section('Bulk Print - verify loaded', async () => {
      await this.bulkPrintBtn.expectVisible();
    });
  }

  async selectDocument(documentName: string) {
    await this.section(`Select document: ${documentName}`, async () => {
      // Dynamic locator based on parameter - acceptable exception
      const document = new Div(
        this.page,
        this.availableListbox.locator.getByRole('option', { name: new RegExp(documentName, 'i') }),
        `Document: ${documentName}`
      );
      
      await document.locator.dblclick();
    });
  }

  async verifyDocumentSelected(documentName: string) {
    await this.section(`Verify document selected: ${documentName}`, async () => {
      // Dynamic locator based on parameter - acceptable exception
      const document = new Div(
        this.page,
        this.selectedListbox.locator.getByRole('option', { name: new RegExp(documentName, 'i') }),
        `Selected Document: ${documentName}`
      );
      
      await document.expectVisible();
    });
  }

  async clickBulkPrint() {
    await this.section('Click Bulk Print', async () => {
      await this.bulkPrintBtn.click();
    });
  }

  async waitForProcessing() {
    await this.section('Wait for bulk print processing', async () => {
      await this.progressBar.expectHidden(60000);
      await this.downloadBtn.locator.waitFor({ state: 'visible', timeout: 10000 });
    });
  }

  async download() {
    await this.downloadBtn.expectVisible();
    
    const [ download ] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadBtn.click(),
    ]);

    return download;
  }

  async close() {
    await this.section('Close bulk print', async () => {
      await this.closeBtn.click();
    });
  }
}
