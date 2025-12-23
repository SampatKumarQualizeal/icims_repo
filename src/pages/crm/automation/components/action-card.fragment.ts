import { Page, Locator } from '@playwright/test';
import { BaseFragment } from './base.fragment';
import { Button } from '@src/components/button.component';

/**
 * ActionCardFragment
 */
export class ActionCardFragment extends BaseFragment {
  readonly saveBtn: Button;
  readonly moreBtn: Button;

  constructor(page: Page, root: Locator, friendlyName: string) {
    super(page, root, friendlyName);

    const saveLoc = page.getByRole('button', { name: 'Save' });
    const moreLoc = page.getByRole('button', { name: 'Open action menu' });

    this.saveBtn = new Button(page, saveLoc, `${friendlyName} Save`);
    this.moreBtn = new Button(page, moreLoc, `${friendlyName} More`);
  }

  async save() {
    await this.section(`${this.friendlyName} - Save action`, async () => {
      await this.saveBtn.click();
    });
  }

  async openMenu() {
    await this.section(`${this.friendlyName} - Open menu`, async () => {
      await this.moreBtn.click();
    });
  }

  async expectVisible() {
    await super.expectVisible();
  }
}
