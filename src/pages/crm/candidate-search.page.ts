// src/pages/crm/candidate-search.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Link } from '@src/components/link.component';

/**
 * CandidateSearchPage
 * CRM candidate search page with search functionality and Create Candidate button
 */
export class CandidateSearchPage extends BasePage {
  readonly createCandidateBtn: Button;
  readonly searchCandidateBtn: Button;
  readonly searchDrawerBtn: Button;
  readonly searchInput: Input;
  readonly searchBtn: Button;
  readonly closeDrawerBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Candidate Search Page');

    this.createCandidateBtn = new Button(
      page,
      page.getByRole('button', { name: 'Create candidate' }),
      'Create Candidate Button'
    );

    this.searchCandidateBtn = new Button(
      page,
      page.getByRole('button', { name: 'Candidate search' }),
      'Candidate Search Button'
    );

    this.searchDrawerBtn = new Button(
      page,
      page.getByRole('button', { name: 'Click to open search drawer' }),
      'Search Drawer Button'
    );

    this.searchInput = new Input(
      page,
      page.getByLabel('Search by keyword'),
      'Search Input'
    );

    this.searchBtn = new Button(
      page,
      page.getByRole('button', { name: 'Search' }),
      'Search Button'
    );

    this.closeDrawerBtn = new Button(
      page,
      page.getByLabel('Close search drawer').first(),
      'Close Drawer Button'
    );
  }

  async expectLoaded() {
    await this.section('Expect CRM Candidate Search page loaded', async () => {
      await this.createCandidateBtn.expectVisible();
    });
  }

  async navigateTo() {
    await this.section('Navigate to Candidate Search', async () => {
      await this.searchCandidateBtn.click();
    });
  }

  async clickCreateCandidate() {
    await this.section('Click Create Candidate', async () => {
      await this.createCandidateBtn.click();
    });
  }

  async openSearchDrawer() {
    await this.section('Open search drawer', async () => {
      await this.searchDrawerBtn.click();
    });
  }

  async searchByKeyword(keyword: string) {
    await this.section(`Search by keyword: ${keyword}`, async () => {
      await this.searchInput.fill(keyword);
      // await this.searchBtn.click();
      // Search results load handled by component auto-wait
    });
  }

  async closeSearchDrawer() {
    await this.section('Close search drawer', async () => {
      await this.closeDrawerBtn.click();
    });
  }

  async verifyCandidateInResults(candidateName: string) {
    await this.section(`Verify candidate in results: ${candidateName}`, async () => {
      const candidateLink = new Link(
        this.page,
        this.page.getByRole('link', { name: candidateName }),
        `Candidate Link: ${candidateName}`
      );
      await candidateLink.expectVisible();
    });
  }

  async clickCandidateLink(candidateName: string) {
    await this.section(`Click candidate link: ${candidateName}`, async () => {
      const candidateLink = new Link(
        this.page,
        this.page.getByRole('link', { name: candidateName }),
        `Candidate Link: ${candidateName}`
      );
      await candidateLink.click();
      await this.page.waitForURL('**/candidates/**');
      // URL change wait sufficient for navigation
    });
  }

  async clickFirstCandidateLink() {
    await this.section('Click first candidate link', async () => {
      const firstCandidateLink = new Link(
        this.page,
        this.page.locator('a[href^="/candidates/"]').first(),
        'First Candidate Link'
      );
      await firstCandidateLink.click();
      await this.page.waitForURL('**/candidates/**');
      // URL change wait sufficient for navigation
    });
  }
}
