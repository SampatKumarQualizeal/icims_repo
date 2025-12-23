import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base.component';

export class Div extends BaseComponent {
  constructor(page: Page, locator: Locator, name: string) {
    super(page, locator, name);
  }

  async getText(): Promise<string> {
    return this.exec(`Get text: ${this.friendlyName}`, async (loc) => {
      return await loc.innerText();
    });
  }
}
