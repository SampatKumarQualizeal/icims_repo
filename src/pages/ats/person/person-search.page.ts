// src/pages/ats/person-search.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Div } from '@src/components/div.component';

/**
 * PersonSearchPage
 * Person/Candidate search page with filters, columns, grouping, and sorting
 */
export class PersonSearchPage extends BasePage {
  // Navigation components (on main page)
  private readonly navigatorMenuBtn: Button;
  private readonly searchBtn: Button;
  private readonly personBtn: Button;
  private readonly candidateLink: Button;
  
  // Search components (in iframe)
  readonly addFilterBtn: Button;
  readonly addColumnBtn: Button;
  readonly addGroupByBtn: Button;
  readonly addSortByBtn: Button;
  readonly searchButton: Button;
  readonly saveSearchTemplateBtn: Button;
  readonly saveOutputTemplateBtn: Button;
  readonly manageSearchTemplatesBtn: Button;
  readonly searchTemplateDropdown: Dropdown;
  readonly typeToSearchInput: Input;
  readonly addSelectedBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve main iframe
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Search Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    
    // Navigation components (on main page)
    this.navigatorMenuBtn = new Button(
      page,
      page.getByRole('button', { name: 'Navigator Menu' }),
      'Navigator Menu'
    );
    
    this.searchBtn = new Button(
      page,
      page.getByRole('button', { name: 'Search' }),
      'Search Button'
    );
    
    this.personBtn = new Button(
      page,
      page.getByRole('button', { name: 'Person' }),
      'Person Button'
    );
    
    this.candidateLink = new Button(
      page,
      page.getByRole('link', { name: 'Candidate' }),
      'Candidate Link'
    );
    
    // Search components (in iframe)
    this.addFilterBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Add Filter' }),
      'Add Filter Button'
    );
    
    this.addColumnBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Add Column' }),
      'Add Column Button'
    );
    
    this.addGroupByBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Add Group By' }),
      'Add Group By Button'
    );
    
    this.addSortByBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Add Sort-By' }),
      'Add Sort-By Button'
    );
    
    this.searchButton = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Search', exact: true }),
      'Search Button'
    );
    
    this.saveSearchTemplateBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Save Search Template' }),
      'Save Search Template Button'
    );
    
    this.saveOutputTemplateBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Save Current Display as Output Template' }),
      'Save Output Template Button'
    );
    
    this.manageSearchTemplatesBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Manage Search Templates' }),
      'Manage Search Templates Button'
    );
    
    this.searchTemplateDropdown = new Dropdown(
      page,
      mainFrame.getByRole('combobox', { name: 'Search Template' }),
      'Search Template Dropdown'
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
  }

  async navigateTo() {
    await this.section('Navigate to Candidate Search', async () => {
      await this.navigatorMenuBtn.click();
      await this.searchBtn.click();
      await this.personBtn.click();
      await this.candidateLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expectLoaded() {
    await this.section('Person Search - verify loaded', async () => {
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
          this.frameLocator!.getByRole('treeitem', { name: item }),
          `Tree Item: ${item}`
        );
        await treeItem.click();
      }
      
      await this.addSelectedBtn.click();
    });
  }

  async selectFilterOptions(options: string[], multiSelect: boolean = false) {
    await this.section(`Select filter options: ${options.join(', ')}`, async () => {
      for (let i = 0; i < options.length; i++) {
        const option = new Button(
          this.page,
          this.frameLocator!.getByRole('option', { name: options[i] }),
          `Option: ${options[i]}`
        );
        
        if (multiSelect && i > 0) {
          await option.click({ modifiers: ['Control'] });
        } else {
          await option.click();
        }
      }
    });
  }

  async fillFilterValue(value: string) {
    await this.section(`Fill filter value: ${value}`, async () => {
      // TODO: Verify selector for filter value input
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
      const dropdown = new Dropdown(
        this.page,
        this.frameLocator!.getByRole('listbox').last(),
        'Filter Dropdown'
      );
      await dropdown.select(value);
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

  async openGroupResultsBy() {
    await this.section('Open Group Results By', async () => {
      const groupBtn = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: /Group Results By/ }),
        'Group Results By Button'
      );
      await groupBtn.click();
    });
  }

  async addGroupBy(fieldName: string, treeItems: string[]) {
    await this.section(`Add group by: ${fieldName}`, async () => {
      await this.addGroupByBtn.click();
      await this.typeToSearchInput.clear();
      await this.typeToSearchInput.fill(fieldName);
      await this.page.waitForLoadState('networkidle');
      
      // Navigate tree and select field
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

  async addGroupByLevel(fieldName: string, treeItems: string[]) {
    await this.section(`Add group by level: ${fieldName}`, async () => {
      const addLevelBtn = new Button(
        this.page,
        this.frameLocator!.getByRole('button', { name: 'Add Level' }),
        'Add Level Button'
      );
      await addLevelBtn.click();
      await this.typeToSearchInput.clear();
      await this.typeToSearchInput.fill(fieldName);
      await this.page.waitForLoadState('networkidle');
      
      // Navigate tree and select field
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

  async deleteExistingSortFields() {
    await this.section('Delete existing sort fields', async () => {
      const deleteButtons = await this.frameLocator!.getByRole('button', { name: /Delete.*Full Name|Delete.*Folder/ }).all();
      for (const btn of deleteButtons) {
        const deleteBtn = new Button(this.page, btn, 'Delete Sort Field');
        await deleteBtn.click();
      }
    });
  }

  async addSortBy(fieldName: string, treeItems: string[]) {
    await this.section(`Add sort by: ${fieldName}`, async () => {
      await this.addSortByBtn.click();
      await this.typeToSearchInput.clear();
      await this.typeToSearchInput.fill(fieldName);
      await this.page.waitForLoadState('networkidle');
      
      // Navigate tree and select field
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

  async setSortOrder(fieldName: string, order: 'Ascending (A to Z)' | 'Descending (Z to A)') {
    await this.section(`Set ${fieldName} sort order to ${order}`, async () => {
      const dropdown = new Dropdown(
        this.page,
        this.frameLocator!.getByRole('combobox', { name: fieldName }),
        `${fieldName} Sort Order Dropdown`
      );
      await dropdown.select(order);
    });
  }

  async runSearch() {
    await this.section('Run search', async () => {
      await this.searchButton.click();
      await this.page.waitForLoadState('networkidle');
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

  async openSaveSearchTemplate() {
    await this.section('Open Save Search Template dialog', async () => {
      await this.saveSearchTemplateBtn.click();
    });
  }

  async openSaveOutputTemplate() {
    await this.section('Open Save Output Template dialog', async () => {
      await this.saveOutputTemplateBtn.click();
    });
  }

  async openManageSearchTemplates() {
    await this.section('Open Manage Search Templates dialog', async () => {
      await this.manageSearchTemplatesBtn.click();
    });
  }

  async verifyTemplateInDropdown(templateName: string) {
    await this.section(`Verify template "${templateName}" in dropdown`, async () => {
      await this.searchTemplateDropdown.click();
      const option = new Button(
        this.page,
        this.frameLocator!.getByRole('option', { name: templateName }),
        `Template: ${templateName}`
      );
      await option.expectVisible();
    });
  }

  async verifyTemplateNotInDropdown(templateName: string) {
    await this.section(`Verify template "${templateName}" not in dropdown`, async () => {
      await this.searchTemplateDropdown.click();
      const option = new Div(
        this.page,
        this.frameLocator!.getByRole('option', { name: templateName }),
        `Template: ${templateName}`
      );
      await option.expectHidden();
    });
  }

  async selectCandidates(count: number) {
    await this.section(`Select ${count} candidates`, async () => {
      for (let i = 1; i <= count; i++) {
        const checkbox = new Div(
          this.page,
          this.frameLocator!.locator('input[type="checkbox"]').nth(i),
          `Candidate Checkbox ${i}`
        );
        await checkbox.locator.check();
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
}
