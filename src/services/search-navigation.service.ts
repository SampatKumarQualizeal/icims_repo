// src/services/search-navigation.service.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * SearchNavigationService
 * Centralized navigation for Search > Entity workflows
 * Eliminates duplicate Navigator > Search > Entity navigation patterns
 * 
 * Usage:
 * - navigateToSearch('Job', 'Job Search') - Navigate via Navigator menu
 * - openProfileFromResults('Software Engineer', 'Job') - Click entity in search results
 * - verifySearchResultsLoaded('Job') - Verify search results page displayed
 */
export class SearchNavigationService extends BasePage {
  readonly navigatorMenuBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'Search Navigation Service');
    
    this.navigatorMenuBtn = new Button(
      page,
      page.getByRole('button', { name: 'Navigator Menu' }),
      'Navigator Menu Button'
    );
  }

  /**
   * Navigate to entity search page via Navigator menu
   * @param entityType - 'Job', 'Person', 'Recruiting Workflow', 'Candidate'
   * @param searchPageName - Optional: 'Job Search', 'Person Search', etc.
   * 
   * @example
   * await searchNav.navigateToSearch('Job', 'Job Search');
   * await searchNav.navigateToSearch('Person'); // No sub-page
   * await searchNav.navigateToSearch('Recruiting Workflow');
   */
  async navigateToSearch(entityType: string, searchPageName?: string) {
    await this.section(`Navigate to ${entityType} Search`, async () => {
      await this.navigatorMenuBtn.click();
      
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      
      // Click Search menu
      const searchLink = new Link(
        this.page,
        mainFrame.getByRole('link', { name: 'Search' }),
        'Search Link'
      );
      await searchLink.click();
      
      // Click entity type (Job, Person, Recruiting Workflow, Candidate)
      const entityLink = new Link(
        this.page,
        mainFrame.getByRole('link', { name: entityType }),
        `${entityType} Link`
      );
      await entityLink.click();
      
      // If specific search page needed (e.g., "Job Search" vs "Job Search Templates")
      if (searchPageName) {
        const searchPageLink = new Link(
          this.page,
          mainFrame.getByRole('link', { name: searchPageName }),
          `${searchPageName} Link`
        );
        await searchPageLink.click();
      }
    });
  }

  /**
   * Open entity profile from search results
   * @param entityName - Name/title of entity to open
   * @param entityType - For logging: 'Job', 'Person', 'Candidate', 'Workflow'
   * 
   * @example
   * await searchNav.openProfileFromResults('Software Engineer', 'Job');
   * await searchNav.openProfileFromResults('John Doe', 'Person');
   */
  async openProfileFromResults(entityName: string, entityType: string = 'Entity') {
    await this.section(`Open ${entityType} profile: ${entityName}`, async () => {
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const entityLink = new Link(
        this.page,
        mainFrame.getByRole('link', { name: entityName }),
        `${entityType} Link: ${entityName}`
      );
      await entityLink.click();
      
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify search results heading is visible
   * @param searchType - 'Job', 'Person', 'Recruiting Workflow', 'Candidate'
   * 
   * @example
   * await searchNav.verifySearchResultsLoaded('Job');
   */
  async verifySearchResultsLoaded(searchType: string) {
    await this.section(`Verify ${searchType} search results loaded`, async () => {
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const resultsHeading = new Link(
        this.page,
        mainFrame.getByText(`${searchType} Search Results`),
        `${searchType} Search Results Heading`
      );
      await resultsHeading.expectVisible();
    });
  }

  /**
   * Click first search result (generic)
   * Useful when entity name is unknown or when selecting first available result
   * 
   * @example
   * await searchNav.openFirstResult('Candidate');
   */
  async openFirstResult(entityType: string = 'Entity') {
    await this.section(`Open first ${entityType} from results`, async () => {
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      const firstResult = new Link(
        this.page,
        mainFrame.locator('table tbody tr').first().getByRole('link').first(),
        `First ${entityType} Result`
      );
      await firstResult.click();
      
      await this.page.waitForLoadState('networkidle');
    });
  }
}
