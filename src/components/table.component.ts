// src/components/table.component.ts
import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '@src/components/base.component';
import { getExecutionProfile } from '@src/utils/execution-profile.util';

export class Table extends BaseComponent {
  readonly root: Locator;

  constructor(page: Page, selector: string | Locator, friendlyName = 'Table') {
    super(page, selector, friendlyName);

    // resolve selector as root locator
    this.root = typeof selector === 'string'
      ? page.locator(selector)
      : selector;
  }

  /** Returns total rows inside <tbody> */
  async rowCount(): Promise<number> {
    return await this.exec('Get row count', async () => {
      return await this.root.locator('tbody tr').count();
    });
  }

  /** Returns a single row (Locator) by index (0-based) */
  row(index: number): Locator {
    return this.root.locator(`tbody tr`).nth(index);
  }

  /** Returns cell locator by row + column index */
  cell(rowIndex: number, colIndex: number): Locator {
    return this.root.locator(`tbody tr`).nth(rowIndex).locator('td').nth(colIndex);
  }

  /** Returns header cell locator by visible text or index */
  header(nameOrIndex: string | number): Locator {
    if (typeof nameOrIndex === 'number') {
      return this.root.locator('thead th').nth(nameOrIndex);
    }
    return this.root.locator('thead th', { hasText: nameOrIndex });
  }

  /** Returns index of a column by header text */
  async columnIndex(headerText: string): Promise<number> {
    return await this.exec(`Find column index for: ${headerText}`, async () => {
      const headers = await this.root.locator('thead th').allInnerTexts();
      const idx = headers.findIndex(h => h.trim() === headerText.trim());
      if (idx === -1) {
        throw new Error(`Column "${headerText}" not found in ${headers.join(', ')}`);
      }
      return idx;
    });
  }

  /** Clicks a column header to sort */
  async sortBy(headerText: string): Promise<void> {
    await this.exec(`Sort table by: ${headerText}`, async () => {
      await this.header(headerText).click();
    });
  }

  /** Finds a row containing given text */
  async findRowByText(text: string | RegExp): Promise<Locator> {
    return await this.exec(`Find row containing: ${text}`, async () => {
      const profile = getExecutionProfile();
      const row = this.root.locator(`tbody tr`, { hasText: text });
      await row.first().waitFor({ state: 'visible', timeout: profile.timeouts.component });
      return row.first();
    });
  }

  /** Click a row by text */
  async clickRow(text: string | RegExp): Promise<void> {
    await this.exec(`Click row containing: ${text}`, async () => {
      await this.findRowByText(text).then(r => r.click());
    });
  }

  /** Get cell value by column name */
  async getCellValue(rowIndex: number, headerText: string): Promise<string> {
    return await this.exec(`Get cell value → row=${rowIndex}, column=${headerText}`, async () => {
      const col = await this.columnIndex(headerText);
      return await this.cell(rowIndex, col).innerText();
    });
  }

  /** Return all row values (2D array) */
  async getAllRows(): Promise<string[][]> {
    return await this.exec('Read all table rows', async () => {
      const rows = this.root.locator('tbody tr');
      const count = await rows.count();

      const results: string[][] = [];

      for (let i = 0; i < count; i++) {
        const cells = rows.nth(i).locator('td');
        const cellCount = await cells.count();
        const rowValues: string[] = [];

        for (let j = 0; j < cellCount; j++) {
          rowValues.push((await cells.nth(j).innerText()).trim());
        }

        results.push(rowValues);
      }

      return results;
    });
  }

  /** Assert a row exists with text */
  async expectRowExists(text: string | RegExp): Promise<void> {
    await this.exec(`Expect row exists: ${text}`, async () => {
      await this.findRowByText(text);
    });
  }

  /** Assert table contains at least N rows */
  async expectMinRows(count: number): Promise<void> {
    await this.exec(`Expect min rows: ${count}`, async () => {
      const actual = await this.rowCount();
      if (actual < count) {
        throw new Error(`Expected at least ${count} rows but found ${actual}`);
      }
    });
  }
}
