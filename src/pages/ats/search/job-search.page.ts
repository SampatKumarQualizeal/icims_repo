// src/pages/ats/job-search.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * JobSearchPage
 * Job search with filters, columns, save search templates
 */
export class JobSearchPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly navigatorMenuBtn: Button;
  readonly searchBtn: Button;
  readonly jobLink: Link;
  readonly addFilterBtn: Button;
  readonly addColumnBtn: Button;
  readonly searchButton: Button;
  readonly saveSearchTemplateBtn: Button;
  readonly typeToSearchInput: Input;
  readonly addSelectedBtn: Button;
  readonly firstJobCheckbox: Div;
  readonly secondJobCheckbox: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Job Search Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    // Navigation components (outside iframe)
    this.navigatorMenuBtn = new Button(
      page,
      page.getByRole('button', { name: 'Navigator Menu' }),
      'Navigator Menu Button'
    );
    
    this.searchBtn = new Button(
      page,
      page.getByRole('button', { name: 'Search' }),
      'Search Button'
    );
    
    this.jobLink = new Link(
      page,
      page.getByRole('link', { name: 'Job' }),
      'Job Link'
    );
    
    // Search components (inside iframe)
    this.addFilterBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: /Add Filter/i }),
      'Add Filter Button'
    );
    
    this.addColumnBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: /Add Column/i }),
      'Add Column Button'
    );
    
    this.searchButton = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Search', exact: true }),
      'Search Button'
    );
    
    this.saveSearchTemplateBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: /Save Search Template/i }),
      'Save Search Template Button'
    );
    
    this.typeToSearchInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: 'Type to Search' }),
      'Type to Search Input'
    );
    
    this.addSelectedBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Add Selected' }),
      'Add Selected Button'
    );
    
    this.firstJobCheckbox = new Div(
      page,
      mainFrame.locator('input[type="checkbox"]').nth(1),
      'First Job Checkbox'
    );
    
    this.secondJobCheckbox = new Div(
      page,
      mainFrame.locator('input[type="checkbox"]').nth(2),
      'Second Job Checkbox'
    );
  }

  async navigateTo() {
    await this.section('Navigate to Job Search', async () => {
      await this.navigatorMenuBtn.click();
      await this.searchBtn.click();
      await this.jobLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expectLoaded() {
    await this.section('Job Search - verify loaded', async () => {
      await this.addFilterBtn.expectVisible();
      await this.searchButton.expectVisible();
    });
  }

  async addFilter(filterName: string, treeItems: string[]) {
    await this.section(`Add filter: ${filterName}`, async () => {
      await this.addFilterBtn.click();
      await this.typeToSearchInput.fill(filterName);
      await this.page.waitForLoadState('networkidle');
      
      // Navigate tree and select filter
      for (const item of treeItems) {
        const treeItem = new Button(
          this.page,
          this.frameLocator!.getByRole('treeitem', { name: new RegExp(item, 'i') }),
          `Tree Item: ${item}`
        );
        await treeItem.click();
      }
      
      await this.addSelectedBtn.click();
    });
  }

  async fillFilterValue(value: string) {
    await this.section(`Fill filter value: ${value}`, async () => {
      const filterInput = new Input(
        this.page,
        this.frameLocator!.locator('input[type="text"]').last(),
        'Filter Value Input'
      );
      await filterInput.fill(value);
    });
  }

  async selectFilterDropdownValue(value: string) {
    await this.section(`Select filter dropdown value: ${value}`, async () => {
      const option = new Button(
        this.page,
        this.frameLocator!.getByRole('option', { name: new RegExp(value, 'i') }).first(),
        `Option: ${value}`
      );
      await option.click();
    });
  }

  async addColumn(columnName: string, treeItems: string[]) {
    await this.section(`Add column: ${columnName}`, async () => {
      await this.addColumnBtn.click();
      await this.typeToSearchInput.clear();
      await this.typeToSearchInput.fill(columnName);
      await this.page.waitForLoadState('networkidle');
      
      // Navigate tree and select column
      for (const item of treeItems) {
        const treeItem = new Button(
          this.page,
          this.frameLocator!.getByRole('treeitem', { name: new RegExp(item, 'i') }),
          `Tree Item: ${item}`
        );
        await treeItem.click();
      }
      
      await this.addSelectedBtn.click();
    });
  }

  async runSearch() {
    await this.section('Run search', async () => {
      await this.searchButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async openSaveSearchTemplate() {
    await this.section('Open Save Search Template dialog', async () => {
      await this.saveSearchTemplateBtn.click();
    });
  }

  async selectJobs(count: number) {
    await this.section(`Select ${count} jobs`, async () => {
      if (count >= 1) {
        const firstCheckbox = new Div(
          this.page,
          this.frameLocator!.locator('input[type="checkbox"]').nth(1),
          'First Job Checkbox'
        );
        await firstCheckbox.locator.check();
      }
      
      if (count >= 2) {
        const secondCheckbox = new Div(
          this.page,
          this.frameLocator!.locator('input[type="checkbox"]').nth(2),
          'Second Job Checkbox'
        );
        await secondCheckbox.locator.check();
      }
    });
  }

  async clickSubmitToWorkflow() {
    await this.section('Click Submit to Workflow button', async () => {
      const submitBtn = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: /Submit to Workflow/i }),
        'Submit to Workflow Button'
      );
      await submitBtn.click();
    });
  }

  async verifySearchResults() {
    await this.section('Verify search results displayed', async () => {
      const resultsDiv = new Div(
        this.page,
        this.frameLocator!.locator('text=Search Results'),
        'Search Results'
      );
      await resultsDiv.expectVisible();
    });
  }
}
