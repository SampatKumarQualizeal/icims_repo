import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Label } from '@src/components/label.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Link } from '@src/components/link.component';

/**
 * MultibrandJobsPage
 * Represents the public multibrand career site jobs page
 * URL Pattern: https://{domain}/{multibrand}/jobs
 * 
 * Features:
 * - Keyword search (job title)
 * - Location search with distance
 * - Category filters
 * - Sort options
 * - Pagination controls
 * - Items per page
 * 
 * NO IFRAMES - Direct page context
 */
export class MultibrandJobsPage extends BasePage {
  // Search components
  readonly keywordSearchInput: Input;
  readonly locationSearchInput: Input;
  readonly findJobsBtn: Button;
  
  // Filter components
  readonly categoriesDropdown: Dropdown;
  readonly removeKeywordBtn: Button;
  readonly removeLocationBtn: Button;
  
  // Results components
  readonly resultsHeading: Label;
  readonly jobSearchHeading: Label;
  readonly locationProximityMessage: Label;
  readonly filtersSelectedMessage: Label;
  
  // Sort and pagination
  readonly sortByDropdown: Dropdown;
  readonly itemsPerPageDropdown: Dropdown;
  readonly nextPageBtn: Button;
  readonly prevPageBtn: Button;
  readonly paginationInfo: Label;
  
  // Language selector
  readonly languageBtn: Button;

  constructor(page: Page) {
    // STEP 1: NO iframe for CST - direct page context
    // STEP 2: Call super with body locator
    super(page, page.locator('body'), 'Multibrand Jobs Page');
    
    // STEP 3: No frameLocator needed (direct page)
    
    // STEP 4: Instantiate components
    // Search components
    this.keywordSearchInput = new Input(
      page,
      page.getByRole('combobox', { name: 'Keyword Search' }),
      'Keyword Search Input'
    );
    
    this.locationSearchInput = new Input(
      page,
      page.getByRole('combobox', { name: 'Search Location' }),
      'Location Search Input'
    );
    
    this.findJobsBtn = new Button(
      page,
      page.getByLabel('Find Jobs'),
      'Find Jobs Button'
    );
    
    // Filter components
    this.categoriesDropdown = new Dropdown(
      page,
      page.getByRole('combobox', { name: 'Categories' }),
      'Categories Dropdown'
    );
    
    this.removeKeywordBtn = new Button(
      page,
      page.getByRole('button', { name: 'remove keyword search' }),
      'Remove Keyword Button'
    );
    
    this.removeLocationBtn = new Button(
      page,
      page.getByRole('button', { name: 'remove location search' }),
      'Remove Location Button'
    );
    
    // Results components
    this.resultsHeading = new Label(
      page,
      page.getByRole('heading', { name: /\d+ results/ }),
      'Results Heading'
    );
    
    this.jobSearchHeading = new Label(
      page,
      page.getByRole('heading', { name: 'Job Search Page' }),
      'Job Search Page Heading'
    );
    
    this.locationProximityMessage = new Label(
      page,
      page.locator('text=/These results are close to/'),
      'Location Proximity Message'
    );
    
    this.filtersSelectedMessage = new Label(
      page,
      page.locator('text=/Filters Selected are:/'),
      'Filters Selected Message'
    );
    
    // Sort and pagination
    this.sortByDropdown = new Dropdown(
      page,
      page.getByRole('combobox', { name: 'Sort by' }),
      'Sort By Dropdown'
    );
    
    this.itemsPerPageDropdown = new Dropdown(
      page,
      page.getByRole('combobox', { name: /Items per page \d+ selected/ }),
      'Items Per Page Dropdown'
    );
    
    this.nextPageBtn = new Button(
      page,
      page.getByRole('button', { name: 'Next Page of Job Search Results' }),
      'Next Page Button'
    );
    
    this.prevPageBtn = new Button(
      page,
      page.getByRole('button', { name: 'Previous Page of Job Search Results' }),
      'Previous Page Button'
    );
    
    this.paginationInfo = new Label(
      page,
      page.locator('text=/\\d+ – \\d+ of \\d+ Total Jobs/'),
      'Pagination Info'
    );
    
    // Language selector
    this.languageBtn = new Button(
      page,
      page.getByRole('button', { name: /language .* arrow_drop_down/ }),
      'Language Button'
    );
  }

  /**
   * Navigate to multibrand jobs page
   */
  async navigateTo(domain: string, multibrandName: string) {
    await this.section(`Navigate to multibrand jobs page: ${multibrandName}`, async () => {
      await this.page.goto(`https://${domain}/${multibrandName}/jobs`);
      await this.page.waitForLoadState('networkidle'); // OK - actual page navigation
    });
  }

  /**
   * Verify jobs page is loaded
   */
  async expectLoaded() {
    await this.section('Verify jobs page loaded', async () => {
      await this.jobSearchHeading.expectVisible();
      await this.resultsHeading.expectVisible();
    });
  }

  /**
   * Search for jobs by keyword (job title)
   */
  async searchByKeyword(keyword: string) {
    await this.section(`Search by keyword: ${keyword}`, async () => {
      await this.keywordSearchInput.fill(keyword);
      await this.findJobsBtn.click();
      // Results reload handled by component auto-wait
    });
  }

  /**
   * Search for jobs by location
   */
  async searchByLocation(location: string) {
    await this.section(`Search by location: ${location}`, async () => {
      await this.locationSearchInput.fill(location);
      await this.findJobsBtn.click();
      // Results reload handled by component auto-wait
    });
  }

  /**
   * Remove keyword search filter
   */
  async removeKeywordFilter() {
    await this.section('Remove keyword filter', async () => {
      await this.removeKeywordBtn.click();
      // Filter removal handled by component auto-wait
    });
  }

  /**
   * Remove location search filter
   */
  async removeLocationFilter() {
    await this.section('Remove location filter', async () => {
      await this.removeLocationBtn.click();
      // Filter removal handled by component auto-wait
    });
  }

  /**
   * Apply category filter from dropdown
   */
  async selectCategoryFilter(categoryName: string) {
    await this.section(`Select category filter: ${categoryName}`, async () => {
      // Open dropdown
      await this.categoriesDropdown.click();
      
      // Select option (with checkbox)
      const option = new Button(
        this.page,
        this.page.getByRole('option', { name: new RegExp(`${categoryName} \\(\\d+\\) checkbox`, 'i') }),
        `Category Option: ${categoryName}`
      );
      await option.click();
      
      // Close dropdown
      await this.page.keyboard.press('Escape');
      // Filter application handled by component auto-wait
    });
  }

  /**
   * Remove specific category filter by name
   */
  async removeCategoryFilter(categoryName: string) {
    await this.section(`Remove category filter: ${categoryName}`, async () => {
      const removeBtn = new Button(
        this.page,
        this.page.getByRole('button', { name: `Remove filter ${categoryName}` }),
        `Remove Filter: ${categoryName}`
      );
      await removeBtn.click();
      // Filter removal handled by component auto-wait
    });
  }

  /**
   * Select sort option from dropdown
   */
  async selectSortOption(sortOption: string) {
    await this.section(`Select sort option: ${sortOption}`, async () => {
      await this.sortByDropdown.click();
      
      const option = new Button(
        this.page,
        this.page.getByRole('option', { name: sortOption }),
        `Sort Option: ${sortOption}`
      );
      await option.click();
      // Sort application handled by component auto-wait
    });
  }

  /**
   * Change items per page
   */
  async changeItemsPerPage(count: number) {
    await this.section(`Change items per page to: ${count}`, async () => {
      await this.itemsPerPageDropdown.click();
      
      const option = new Button(
        this.page,
        this.page.getByRole('option', { name: String(count), exact: true }),
        `Items Per Page: ${count}`
      );
      await option.click();
      // Pagination update handled by component auto-wait
    });
  }

  /**
   * Navigate to next page
   */
  async goToNextPage() {
    await this.section('Go to next page', async () => {
      await this.nextPageBtn.click();
      // Page load handled by component auto-wait
    });
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage() {
    await this.section('Go to previous page', async () => {
      await this.prevPageBtn.click();
      // Page load handled by component auto-wait
    });
  }

  /**
   * Verify results count matches expected
   */
  async verifyResultsCount(expectedCount: number) {
    await this.section(`Verify results count: ${expectedCount}`, async () => {
      const heading = new Label(
        this.page,
        this.page.getByRole('heading', { name: `${expectedCount} results` }),
        `${expectedCount} Results Heading`
      );
      await heading.expectVisible();
    });
  }

  /**
   * Verify specific job appears in results
   */
  async verifyJobInResults(jobTitle: string) {
    await this.section(`Verify job in results: ${jobTitle}`, async () => {
      const jobLink = new Link(
        this.page,
        this.page.getByRole('link', { name: jobTitle }).first(),
        `Job Link: ${jobTitle}`
      );
      await jobLink.expectVisible();
    });
  }

  /**
   * Verify URL contains expected parameter
   */
  async verifyURLParam(param: string, value?: string) {
    await this.section(`Verify URL parameter: ${param}${value ? `=${value}` : ''}`, async () => {
      const url = this.page.url();
      const regex = value ? new RegExp(`${param}=${value}`) : new RegExp(param);
      if (!regex.test(url)) {
        throw new Error(`URL does not contain expected parameter: ${param}${value ? `=${value}` : ''}\nActual URL: ${url}`);
      }
      this.logger.info(`✓ URL contains: ${param}${value ? `=${value}` : ''}`);
    });
  }

  /**
   * Verify location proximity message is visible
   */
  async verifyLocationProximity(location: string) {
    await this.section(`Verify location proximity message: ${location}`, async () => {
      const message = new Label(
        this.page,
        this.page.getByText(new RegExp(`These results are close to ${location}`, 'i')),
        `Location Proximity: ${location}`
      );
      await message.expectVisible();
    });
  }

  /**
   * Verify filters selected message with filter name
   */
  async verifyFilterSelected(filterName: string) {
    await this.section(`Verify filter selected: ${filterName}`, async () => {
      const message = new Label(
        this.page,
        this.page.getByText(`Filters Selected are: ${filterName}`),
        `Filters Selected: ${filterName}`
      );
      await message.expectVisible();
    });
  }

  /**
   * Verify pagination info matches expected range
   */
  async verifyPaginationInfo(start: number, end: number, total: number) {
    await this.section(`Verify pagination: ${start} – ${end} of ${total}`, async () => {
      const info = new Label(
        this.page,
        this.page.getByText(`${start} – ${end} of ${total} Total Jobs`),
        'Pagination Info'
      );
      await info.expectVisible();
    });
  }

  /**
   * Verify next button state
   */
  async verifyNextButtonState(shouldBeEnabled: boolean) {
    await this.section(`Verify next button ${shouldBeEnabled ? 'enabled' : 'disabled'}`, async () => {
      if (shouldBeEnabled) {
        await this.nextPageBtn.verifyEnabled();
      } else {
        await this.nextPageBtn.verifyDisabled();
      }
    });
  }

  /**
   * Verify previous button state
   */
  async verifyPrevButtonState(shouldBeEnabled: boolean) {
    await this.section(`Verify previous button ${shouldBeEnabled ? 'enabled' : 'disabled'}`, async () => {
      if (shouldBeEnabled) {
        await this.prevPageBtn.verifyEnabled();
      } else {
        await this.prevPageBtn.verifyDisabled();
      }
    });
  }
}
