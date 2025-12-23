// src/pages/ats/dashboard-factoid.modal.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';

/**
 * DashboardFactoidModal
 * Modal for creating factoid widgets on dashboards
 */
export class DashboardFactoidModal extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly factoidNameInput: Input;
  readonly searchTemplateDropdown: Dropdown;
  readonly shareDropdown: Dropdown;
  readonly saveExitBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Modal in iframe
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const modalLoc = mainFrame.locator('body');
    
    // STEP 2: Call super
    super(page, modalLoc, 'Dashboard Factoid Modal');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    this.factoidNameInput = new Input(
      page,
      mainFrame.getByLabel(/Name/i).first(),
      'Factoid Name Input'
    );
    
    this.searchTemplateDropdown = new Dropdown(
      page,
      mainFrame.getByLabel(/Search Template|Template/i).first(),
      'Search Template Dropdown'
    );
    
    this.shareDropdown = new Dropdown(
      page,
      mainFrame.getByLabel(/Share/i).last(),
      'Share With Dropdown'
    );
    
    this.saveExitBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: /Save.*Exit|Save/i }).first(),
      'Save and Exit Button'
    );
    
    this.cancelBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Cancel' }),
      'Cancel Button'
    );
  }

  async expectLoaded() {
    await this.section('Dashboard Factoid Modal - verify loaded', async () => {
      await this.factoidNameInput.expectVisible();
      await this.saveExitBtn.expectVisible();
    });
  }

  async createFactoid(data: {
    name: string;
    searchTemplate: string;
    share: string;
  }) {
    await this.section(`Create factoid: ${data.name}`, async () => {
      await this.factoidNameInput.fill(data.name);
      await this.searchTemplateDropdown.select(data.searchTemplate);
      await this.shareDropdown.select(data.share);
      
      await this.saveExitBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
