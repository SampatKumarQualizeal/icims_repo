// src/services/quick-search.service.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Input } from '@src/components/input.component';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * QuickSearchService
 * Unified service for quick search functionality across all entities (Person, Job, etc.)
 * Consolidates previous QuickSearchPage and PersonQuickSearchPage implementations
 */
export class QuickSearchService extends BasePage {
  readonly quickSearchInput: Input;
  readonly eventBtn: Button;
  readonly quickSearchButton: Button;

  constructor(page: Page) {
    // Quick search is on main page (no iframe)
    super(page, page.locator('body'), 'Quick Search Service');
    
    // Quick search input (used for Person/Candidate search)
    this.quickSearchInput = new Input(
      page,
      page.getByRole('combobox', { name: 'Quick search' }),
      'Quick Search Input'
    );
    
    // Event menu button (used for Job/Entity search)
    this.eventBtn = new Button(
      page,
      page.getByRole('button', { name: 'Event' }),
      'Event Menu'
    );
    
    // Quick search button
    this.quickSearchButton = new Button(
      page,
      page.getByRole('button', { name: 'Quick Search' }),
      'Quick Search Button'
    );
  }

  async expectLoaded() {
    await this.section('Quick Search - verify loaded', async () => {
      await this.quickSearchInput.expectVisible();
    });
  }

  /**
   * Search for person/candidate by name and select from results
   * @param firstName - Person's first name
   * @param lastName - Person's last name
   */
  async searchAndSelectPerson(firstName: string, lastName: string) {
    await this.section(`Quick search for person: ${firstName} ${lastName}`, async () => {
      // Click and fill search input
      await this.quickSearchInput.click();
      await this.quickSearchInput.fill(firstName);
      
      // Wait for search results to populate
      await this.page.waitForLoadState('networkidle');
      
      // Click on the person from search results
      const personOption = new Div(
        this.page,
        this.page.getByRole('option', { 
          name: new RegExp(`${firstName}.*${lastName}`, 'i') 
        }),
        `Person Result: ${firstName} ${lastName}`
      );
      
      await personOption.click();
      
      // Wait for profile to load
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Search for person/candidate by email and select from results
   * @param email - Person's email address
   */
  async searchAndSelectPersonByEmail(email: string) {
    await this.section(`Quick search for person by email: ${email}`, async () => {
      // Click and fill search input
      await this.quickSearchInput.click();
      await this.quickSearchInput.fill(email);
      
      // Wait for search results to populate
      await this.page.waitForLoadState('networkidle');
      
      // Click on the first person result
      const personOption = new Div(
        this.page,
        this.page.getByRole('option').first(),
        `Person Result: ${email}`
      );
      
      await personOption.click();
      
      // Wait for profile to load
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify person profile heading is displayed
   * @param firstName - Person's first name
   * @param lastName - Person's last name
   */
  async verifyPersonProfileDisplayed(firstName: string, lastName: string) {
    await this.section(`Verify person profile displayed: ${firstName} ${lastName}`, async () => {
      const profileHeading = new Div(
        this.page,
        this.page.getByRole('heading', { 
          name: new RegExp(`${firstName}.*${lastName}`, 'i') 
        }),
        `Profile Heading: ${firstName} ${lastName}`
      );
      
      await profileHeading.expectVisible();
    });
  }

  /**
   * Search for entity via Event menu (Job, Workflow, etc.)
   * @param entityType - Type of entity ('Job', 'Workflow', etc.)
   * @param searchValue - Value to search for
   */
  async searchByEntityMenu(entityType: string, searchValue: string) {
    await this.section(`Quick Search: ${entityType} > ${searchValue}`, async () => {
      const menuItem = new Button(
        this.page,
        this.page.getByRole('menuitem', { name: entityType }),
        `Quick Search Menu Item: ${entityType}`
      );
      
      const searchResult = new Div(
        this.page,
        this.page.locator(`//div[@id='navbarquicksearch-autocomplete-popper']//li/div[contains(.,'${searchValue}')]`),
        `Quick Search Result: ${searchValue}`
      );
      
      // Open Event menu and select entity type
      await this.eventBtn.click();
      await menuItem.click();
      
      // Fill search and select result
      await this.quickSearchInput.click();
      await this.quickSearchInput.fill(searchValue);
      await searchResult.click();
    });
  }

  /**
   * Quick search for Job by ID
   * @param jobId - Job ID to search for
   */
  async searchAndSelectJob(jobId: string) {
    await this.section(`Quick search for job: ${jobId}`, async () => {
      await this.searchByEntityMenu('Job', jobId);
    });
  }

  /**
   * Quick search for Workflow
   * @param workflowName - Workflow name to search for
   */
  async searchAndSelectWorkflow(workflowName: string) {
    await this.section(`Quick search for workflow: ${workflowName}`, async () => {
      await this.searchByEntityMenu('Workflow', workflowName);
    });
  }
}
