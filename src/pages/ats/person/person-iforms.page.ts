// src/pages/ats/person-iforms.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Div } from '@src/components/div.component';
import { Input } from '@src/components/input.component';

/**
 * PersonIFormsPage
 * Person profile iForms tab - view and fill iForms associated with a person
 */
export class PersonIFormsPage extends BasePage {
  readonly moreTab: Button;
  readonly iFormsMenuItem: Button;
  readonly iFormDropdown: Dropdown;
  readonly editBtn: Button;
  readonly saveAndExitBtn: Button;
  readonly errorMessage: Div;
  readonly iFormSearchBox: Input;
  readonly targetframeLocator: FrameLocator | null = null;  

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes (3 levels)
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const targetFrame = mainFrame.frameLocator('iframe[name="target_frame_left"]');
    const iFormsFrame = targetFrame.frameLocator('iframe[title="iForms Center"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person iForms Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = iFormsFrame;
    this.targetframeLocator = targetFrame;
    // STEP 4: Instantiate components
    this.moreTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'More' }),
      'More Tab'
    );
    
    this.iFormsMenuItem = new Button(
      page,
      mainFrame.getByRole('menuitem', { name: 'iForms' }),
      'iForms Menu Item'
    );
    
    this.iFormDropdown = new Dropdown(
      page,
      targetFrame.getByRole('combobox', { name: 'iForm' }),
      'iForm Dropdown'
    );

    this.iFormSearchBox = new Input(
      page,
      targetFrame.getByRole('combobox', { name: '— Type to Search —' }),
      'iForm Dropdown'
    );
    
    this.editBtn = new Button(
      page,
      targetFrame.getByRole('button', {  name: ' Edit'}),
      'Edit Button'
    );
    
    this.saveAndExitBtn = new Button(
      page,
      iFormsFrame.getByRole('button', { name: 'Save & Exit' }),
      'Save & Exit Button'
    );
    
    this.errorMessage = new Div(
      page,
      iFormsFrame.locator('xpath=//*[contains(@class, "alert")]'),
      'Error Message'
    );
  }

  async expectLoaded() {
    await this.section('Person iForms - verify loaded', async () => {
      await this.iFormDropdown.expectVisible();
    });
  }

  async navigateToiForms() {
    await this.section('Navigate to iForms tab', async () => {
      await this.moreTab.click();
      await this.page.waitForTimeout(1000);
      await this.iFormsMenuItem.click();
      await this.page.waitForTimeout(2000);
    });
  }

  async selectIForm(iFormId: string) {
    await this.section(`Select iForm: ${iFormId}`, async () => {
      await this.iFormDropdown.click();
      await this.iFormSearchBox.type(iFormId);
      const option = this.targetframeLocator!.locator(`text="${iFormId}"`).first();
      await this.page.waitForTimeout(1000);
      await option.click();
      await this.page.waitForTimeout(3000);
    });
  }

  async verifyFieldsVisible(fieldNames: string[]) {
    await this.section('Verify iForm fields visible', async () => {
      for (const fieldName of fieldNames) {
        const fieldLabel = new Div(
          this.page,
          this.frameLocator!.locator(`text=${fieldName}`),
          `Field Label: ${fieldName}`
        );
        await fieldLabel.expectVisible();
      }
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
      await this.page.waitForTimeout(5000);
    });
  }

  async fillDateField(fieldName: string, date: { month: string; day: string; year: string }) {
    await this.section(`Fill date field ${fieldName}`, async () => {
      // Select month
      const monthDropdown = new Dropdown(
        this.page,
        this.frameLocator!.locator(`#icims_f_${fieldName}_Month`),
        `${fieldName} Month`
      );
      await monthDropdown.select(date.month);
      
      // Select day
      const dayDropdown = new Dropdown(
        this.page,
        this.frameLocator!.locator(`#icims_f_${fieldName}_Date`),
        `${fieldName} Day`
      );
      await dayDropdown.select(date.day);
      
      // Fill year textbox
      const yearInput = new Input(
        this.page,
        this.frameLocator!.locator(`#icims_f_${fieldName}_Year`),
        `${fieldName} Year`
      );
      await yearInput.fill(date.year);
    });
  }

  async saveAndExit() {
    await this.section('Click Save & Exit', async () => {
      await this.saveAndExitBtn.click();
      await this.page.waitForTimeout(2000);
    });
  }

  async verifyErrorMessage(expectedError: string) {
    await this.section(`Verify error message: ${expectedError}`, async () => {
      await this.errorMessage.expectVisible();
      const errorText = await this.errorMessage.getText();
      
      if (!errorText.includes(expectedError)) {
        throw new Error(`Expected error "${expectedError}" but got "${errorText}"`);
      }
    });
  }

  async verifyNoErrorMessage() {
    await this.section('Verify no error message', async () => {
      const errorVisible = await this.errorMessage.isVisible().catch(() => false);
      
      if (errorVisible) {
        const errorText = await this.errorMessage.getText();
        throw new Error(`Unexpected error message: ${errorText}`);
      }
    });
  }

  async verifyEditButtonVisible() {
    await this.section('Verify Edit button visible', async () => {
      await this.editBtn.expectVisible();
    });
  }
}
