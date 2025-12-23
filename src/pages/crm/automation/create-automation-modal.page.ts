import { Page, Locator } from '@playwright/test';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';

/**
 * CreateAutomationModalPage
 */
export class CreateAutomationModalPage extends BasePage {
  readonly campaignName: Input;
  readonly pipelineSelect: Dropdown;
  readonly submitBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Create Automation Modal');

    const campaignNameLoc: Locator = page.getByRole('textbox', { name: 'Campaign name*' });
    const pipelineSelectLoc: Locator = page.getByRole('combobox', { name: 'Pipeline*' });
    const submitBtnLoc: Locator = page.getByRole('button', { name: 'Submit' });

    this.campaignName = new Input(page, campaignNameLoc, 'Campaign name');
    this.pipelineSelect = new Dropdown(page, pipelineSelectLoc, 'Pipeline select');
    this.submitBtn = new Button(page, submitBtnLoc, 'Submit');
  }

  async expectLoaded(timeout = 7000) {
    await this.section('Create Automation Modal - expect loaded', async () => {
      await this.campaignName.expectVisible();
      await this.pipelineSelect.expectVisible();
    });
  }

  async fillName(name: string) {
    await this.section('Fill campaign name', async () => {
      await this.campaignName.fill(name);
    });
  }

  async selectPipelineByVisibleText(text: string) {
    await this.section('Select pipeline', async () => {
      await this.pipelineSelect.select(text);
    });
  }

  async submit() {
    await this.section('Submit create automation', async () => {
      await this.submitBtn.click();
    });
  }
}
