// src/pages/ats/iform-field-dependencies.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * IFormFieldDependenciesPage
 * Field Dependencies tab of iForm editor - create and manage field dependencies
 */
export class IFormFieldDependenciesPage extends BasePage {
  readonly createDependencyBtn: Button;
  readonly maintenanceTab: Link;

  constructor(page: Page) {
    // STEP 1: Resolve main iframe
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'iForm Field Dependencies Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    this.createDependencyBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Create Dependency' }),
      'Create Dependency Button'
    );
    
    this.maintenanceTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Maintenance' }),
      'Maintenance Tab'
    );
  }

  async expectLoaded() {
    await this.section('iForm Field Dependencies - verify loaded', async () => {
      await this.createDependencyBtn.expectVisible();
    });
  }

  async openCreateDependency() {
    await this.section('Open create dependency popup', async () => {
      await this.createDependencyBtn.click();
    });
  }

  async navigateToMaintenance() {
    await this.section('Navigate to Maintenance tab', async () => {
      await this.maintenanceTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
