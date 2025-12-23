// src/pages/ats/manage-dashboards.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ManageDashboardsPage
 * Manage dashboards and create new dashboard items/widgets
 */
export class ManageDashboardsPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly navigatorMenuBtn: Button;
  readonly reportBtn: Button;
  readonly manageDashboardLink: Link;
  readonly addDashboardBtn: Button;
  readonly addWidgetBtn: Button;
  readonly dashboardNameInput: Input;
  readonly typeDropdown: Dropdown;
  readonly positionDropdown: Dropdown;
  readonly shareDropdown: Dropdown;
  readonly saveDashboardBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Manage Dashboards Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    // Navigation components (outside iframe)
    this.navigatorMenuBtn = new Button(
      page,
      page.getByRole('button', { name: 'Navigator Menu' }),
      'Navigator Menu Button'
    );
    
    this.reportBtn = new Button(
      page,
      page.getByRole('button', { name: 'Report' }),
      'Report Button'
    );
    
    this.manageDashboardLink = new Link(
      page,
      page.getByRole('link', { name: /Manage Dashboard/i }),
      'Manage Dashboard Link'
    );
    
    // Dashboard management components (inside iframe)
    this.addDashboardBtn = new Button(
      page,
      mainFrame.locator('button, a').filter({ hasText: /\+|Add|New/i }).first(),
      'Add Dashboard Button'
    );
    
    this.addWidgetBtn = new Button(
      page,
      mainFrame.locator('button, a').filter({ hasText: /\+|Add/i }).first(),
      'Add Widget Button'
    );
    
    this.dashboardNameInput = new Input(
      page,
      mainFrame.getByLabel(/Name/i).first(),
      'Dashboard Name Input'
    );
    
    this.typeDropdown = new Dropdown(
      page,
      mainFrame.getByLabel(/Type/i).first(),
      'Type Dropdown'
    );
    
    this.positionDropdown = new Dropdown(
      page,
      mainFrame.getByLabel(/Position|Screen/i).first(),
      'Position Dropdown'
    );
    
    this.shareDropdown = new Dropdown(
      page,
      mainFrame.getByLabel(/Allow|Share/i).first(),
      'Share/Allow Dropdown'
    );
    
    this.saveDashboardBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: /Save/i }).first(),
      'Save Dashboard Button'
    );
  }

  async navigateTo() {
    await this.section('Navigate to Manage Dashboards', async () => {
      await this.navigatorMenuBtn.click();
      await this.reportBtn.click();
      await this.manageDashboardLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expectLoaded() {
    await this.section('Manage Dashboards - verify loaded', async () => {
      await this.addDashboardBtn.expectVisible();
    });
  }

  async createDashboard(data: {
    name: string;
    type: string;
    position: string;
    share: string;
  }) {
    await this.section(`Create dashboard: ${data.name}`, async () => {
      await this.addDashboardBtn.click();
      
      await this.dashboardNameInput.fill(data.name);
      await this.typeDropdown.select(data.type);
      await this.positionDropdown.select(data.position);
      await this.shareDropdown.select(data.share);
      
      await this.saveDashboardBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async addWidget() {
    await this.section('Add widget to dashboard', async () => {
      await this.addWidgetBtn.click();
    });
  }

  async clickFactoidWidget(widgetName: string) {
    await this.section(`Click factoid widget: ${widgetName}`, async () => {
      const factoidWidget = new Div(
        this.page,
        this.frameLocator!.locator('text=/'+widgetName+'|\\d+/i').first(),
        `Factoid Widget: ${widgetName}`
      );
      await factoidWidget.locator.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyFactoidVisible(widgetName: string) {
    await this.section(`Verify factoid visible: ${widgetName}`, async () => {
      const factoidWidget = new Div(
        this.page,
        this.frameLocator!.locator('text=/'+widgetName+'/i').first(),
        `Factoid Widget: ${widgetName}`
      );
      await factoidWidget.expectVisible();
    });
  }
}
