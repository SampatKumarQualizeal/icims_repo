// src/pages/ats/iform-views.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * IFormViewsPage
 * Views tab of iForm editor - contains rich text editor for form layout
 * Note: Rich text editor is in nested iframe (main-body > editor iframe)
 */
export class IFormViewsPage extends BasePage {
  readonly saveLink: Link;
  readonly insertGrouploopBtn: Button;
  readonly insertDependentFieldGroupBtn: Button;
  readonly questionsTab: Link;
  readonly maintenanceTab: Link;
  private editorFrame: FrameLocator;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes (3 levels for iForms)
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'iForm Views Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // Resolve nested TinyMCE editor iframe
    this.editorFrame = mainFrame.frameLocator('#webview_jsp_ifr');
    
    // STEP 4: Instantiate components
    // this.saveLink = new Link(
    //   page,
    //   mainFrame.getByRole('button', { name: 'Save' }),
    //   'Save Button'
    // );

    this.saveLink = new Link(
      page,
      mainFrame.getByText('Save', { exact: true }),
      'Save Link'
    );
    
    this.insertGrouploopBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Insert New Grouploop' }),
      'Insert Grouploop Button'
    );
    
    this.insertDependentFieldGroupBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Insert Dependent Field Group' }),
      'Insert Dependent Field Group Button'
    );
    
    this.questionsTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Questions' }),
      'Questions Tab'
    );
    
    this.maintenanceTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Maintenance' }),
      'Maintenance Tab'
    );
  }

  async expectLoaded() {
    await this.section('iForm Views - verify loaded', async () => {
      await this.saveLink.expectVisible();
    });
  }

  async fillEditorContent(content: string) {
    await this.section('Fill TinyMCE editor content', async () => {
      const editorBody = this.editorFrame.locator('#tinymce');
      await editorBody.click();
      await editorBody.fill(content);
    });
  }

  async appendEditorContent(content: string) {
    await this.section('Append rich text editor content', async () => {
      const editorBody = this.editorFrame.locator('body');
      // TODO: Verify how to append vs replace content
      await editorBody.fill(content);
    });
  }

  async save() {
    await this.section('Save iForm views', async () => {
      await this.saveLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async insertGrouploop(grouploopName: string) {
    await this.section(`Insert grouploop: ${grouploopName}`, async () => {
      await this.insertGrouploopBtn.click();
      
      // Handle dialog
      this.page.once('dialog', async dialog => {
        await dialog.accept(grouploopName);
      });
    });
  }

  async insertDependentFieldGroup(groupName: string) {
    await this.section(`Insert dependent field group: ${groupName}`, async () => {
      await this.insertDependentFieldGroupBtn.click();
      
      // Handle dialog
      this.page.once('dialog', async dialog => {
        await dialog.accept(groupName);
      });
    });
  }

  async navigateToQuestions() {
    await this.section('Navigate to Questions tab', async () => {
      await this.questionsTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async navigateToMaintenance() {
    await this.section('Navigate to Maintenance tab', async () => {
      await this.maintenanceTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
