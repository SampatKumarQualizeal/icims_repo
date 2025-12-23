// src/pages/ats/hiring-automation-create.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Div } from '@src/components/div.component';

/**
 * HiringAutomationCreatePage
 * Create/Edit automation rule form
 */
export class HiringAutomationCreatePage extends BasePage {
  protected mainFrame?: FrameLocator;
  readonly createHeading: Div;
  readonly automationNameInput: Input;
  readonly triggerCategoryDropdown: Dropdown;
  readonly binDropdown: Dropdown;
  readonly statusDropdown: Dropdown;
  readonly searchCriteriaInput: Input;
  readonly automationTypeDropdown: Dropdown;
  readonly bodyInput: Input;
  readonly nextBtn: Button;
  readonly saveBtn: Button;
  readonly textPreview: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Hiring Automation Create Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.createHeading = new Div(
      page,
      mainFrame.getByText('Create Automation'),
      'Create Automation Heading'
    );
    
    this.automationNameInput = new Input(
      page,
      mainFrame.getByLabel('Automation Name'),
      'Automation Name Input'
    );
    
    this.triggerCategoryDropdown = new Dropdown(
      page,
      mainFrame.getByLabel('Trigger Category'),
      'Trigger Category Dropdown'
    );
    
    this.binDropdown = new Dropdown(
      page,
      mainFrame.getByLabel('Bin'),
      'Bin Dropdown'
    );
    
    this.statusDropdown = new Dropdown(
      page,
      mainFrame.getByLabel('Status'),
      'Status Dropdown'
    );
    
    this.searchCriteriaInput = new Input(
      page,
      mainFrame.getByLabel('Search Criteria'),
      'Search Criteria Input'
    );
    
    this.automationTypeDropdown = new Dropdown(
      page,
      mainFrame.getByLabel('Automation Type'),
      'Automation Type Dropdown'
    );
    
    this.bodyInput = new Input(
      page,
      mainFrame.getByLabel('Body'),
      'Body Input'
    );
    
    this.nextBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Next' }),
      'Next Button'
    );
    
    this.saveBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.textPreview = new Div(
      page,
      mainFrame.locator('[data-testid="text-preview"]'),
      'Text Preview'
    );
  }

  async expectLoaded() {
    await this.section('Hiring Automation Create - verify loaded', async () => {
      await this.createHeading.expectVisible();
      await this.automationNameInput.expectVisible();
    });
  }

  async fillAutomationName(name: string) {
    await this.section(`Fill automation name: ${name}`, async () => {
      await this.automationNameInput.fill(name);
    });
  }

  async selectTriggerCategory(category: string) {
    await this.section(`Select trigger category: ${category}`, async () => {
      await this.triggerCategoryDropdown.locator.click();
      const option = new Button(
        this.page,
        this.mainFrame!.getByRole('option', { name: category }),
        `Trigger Category: ${category}`
      );
      await option.click();
    });
  }

  async selectBin(binName: string) {
    await this.section(`Select bin: ${binName}`, async () => {
      await this.binDropdown.locator.click();
      const option = new Button(
        this.page,
        this.mainFrame!.getByRole('option', { name: binName }),
        `Bin: ${binName}`
      );
      await option.click();
    });
  }

  async selectStatus(statusName: string) {
    await this.section(`Select status: ${statusName}`, async () => {
      await this.statusDropdown.locator.click();
      const option = new Button(
        this.page,
        this.mainFrame!.getByRole('option', { name: statusName }),
        `Status: ${statusName}`
      );
      await option.click();
    });
  }

  async clickNext() {
    await this.section('Click Next', async () => {
      await this.nextBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async selectAutomationType(typeName: string) {
    await this.section(`Select automation type: ${typeName}`, async () => {
      await this.automationTypeDropdown.locator.click();
      const option = new Button(
        this.page,
        this.mainFrame!.getByRole('option', { name: typeName }),
        `Automation Type: ${typeName}`
      );
      await option.click();
    });
  }

  async fillTextBody(body: string) {
    await this.section('Fill text body', async () => {
      await this.bodyInput.fill(body);
    });
  }

  async clickSave() {
    await this.section('Click Save', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifyTextPreview(expectedText: string) {
    await this.section('Verify text preview contains expected text', async () => {
      const previewText = await this.textPreview.getText();
      if (!previewText.includes(expectedText)) {
        throw new Error(`Text preview does not contain: ${expectedText}`);
      }
    });
  }
}
