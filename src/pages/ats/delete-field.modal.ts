// src/pages/ats/delete-field.modal.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Div } from '@src/components/div.component';

/**
 * DeleteFieldModal
 * Confirmation dialog for deleting profile fields or field groups
 */
export class DeleteFieldModal extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly confirmCheckbox: Checkbox;
  readonly deleteBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const configFrame = mainFrame.frameLocator('#configContentIFrame');
    
    // STEP 2: Call super - dialog is within config frame
    super(page, configFrame.getByRole('dialog').locator('body'), 'Delete Field Modal');
    
    // STEP 3: Store frameLocator
    this.frameLocator = configFrame;
    
    // STEP 4: Instantiate components
    this.confirmCheckbox = new Checkbox(
      page,
      configFrame.getByRole('checkbox', { name: /I've read the above warning/i }),
      'Confirm Deletion Checkbox'
    );
    
    this.deleteBtn = new Button(
      page,
      configFrame.getByRole('dialog').getByRole('button', { name: 'Delete' }),
      'Delete Button'
    );
    
    this.cancelBtn = new Button(
      page,
      configFrame.getByRole('dialog').getByRole('button', { name: 'Cancel' }),
      'Cancel Button'
    );
  }

  async expectLoaded() {
    await this.section('Delete Field Modal - verify loaded', async () => {
      const dialogTitle = new Div(
        this.page,
        this.frameLocator!.getByRole('dialog').getByText('Delete Field'),
        'Delete Field Dialog Title'
      );
      await dialogTitle.expectVisible();
      await this.confirmCheckbox.expectVisible();
      await this.deleteBtn.expectVisible();
    });
  }

  async confirmDeletion() {
    await this.section('Confirm deletion', async () => {
      await this.confirmCheckbox.check();
      await this.deleteBtn.click();
      // Wait for dialog to close
      await this.frameLocator!.getByRole('dialog').waitFor({ state: 'detached' });
    });
  }

  async cancel() {
    await this.section('Cancel deletion', async () => {
      await this.cancelBtn.click();
      // Wait for dialog to close
      await this.frameLocator!.getByRole('dialog').waitFor({ state: 'detached' });
    });
  }
}
