import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { Label } from '@src/components/label.component';
import { BasePage } from '@src/pages/base.page';
import { ActionCardFragment } from './components/action-card.fragment';

/**
 * AutomationBuilderPage
 */
export class AutomationBuilderPage extends BasePage {
  readonly addActionBtn: Button;
  readonly header: Label;
  readonly actionsBtn: Button;
  readonly archiveCampaignBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Automation Builder Page');

    const headerLoc = page.locator("//header[contains(.,'Automation builder:')]");
    const actionsBtnLoc = page.getByRole('button', { name: 'Actions' });

    this.header = new Label(page, headerLoc, 'Builder Header');
    this.actionsBtn = new Button(page, actionsBtnLoc, 'Actions Menu');

    this.addActionBtn = new Button(page, page.getByRole('button', { name: 'add' }),"Add Action button");
    this.archiveCampaignBtn = new Button(page, this.page.getByRole('button', {name: 'Archive automated campaign',}),"Archive automation button");
  }

  async expectLoadedWithName(name: string, timeout = 7000) {
    await this.section('AutomationBuilder - expect loaded with name', async () => {
      await this.expectVisible(timeout);
      await this.header.expectVisible();
    });
  }

  async clickAdd(index = 0) {
    await this.section(`Builder - Click add(${index})`, async () => {
      await this.page.getByRole('button', { name: 'add' }).nth(index).click();
    });
  }

  actionCardByText(text: string) {
    const root = this.resolveLocator(`.action-card:has-text("${text}")`);
    return new ActionCardFragment(this.page, root, `ActionCard(${text})`);
  }

  async openActionsMenu() {
    await this.section('Open main Actions menu', async () => {
      await this.actionsBtn.click();
    });
  }

  async verifyCardAndSave(cardText: string) {
    await this.section(`Verify action card "${cardText}" and save`, async () => {
      const card = this.actionCardByText(cardText);
      await card.expectVisible();
      await card.save();
    });
  }
}