// src/components/label.component.ts

import { Locator, Page, expect } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Label extends BaseComponent {

  constructor(page: Page, selectorOrLocator: string | Locator, friendlyName: string) {
    super(page, selectorOrLocator, friendlyName);
  }

  async expectText(text: string | RegExp, timeout = 5000) {
    return this.exec(`Expect label text: ${text}`, async (loc) => {
      await expect(loc).toContainText(text, { timeout });
    });
  }

  async getText(): Promise<string> {
    return this.exec(`Get text of ${this.friendlyName}`, async (loc) => {
      return await loc.innerText();
    });
  }

  async expectVisible(timeout = 5000) {
    return this.exec(`Expect label visible`, async (loc) => {
      await expect(loc).toBeVisible({ timeout });
    });
  }
}
