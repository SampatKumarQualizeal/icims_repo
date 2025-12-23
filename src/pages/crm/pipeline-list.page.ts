// src/pages/crm/pipeline-list.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * PipelineListPage
 * CRM pipelines list page with create, search, and manage functionality
 */
export class PipelineListPage extends BasePage {
  readonly createPipelineBtn: Button;
  readonly pipelineNameInput: Input;
  readonly standardRadio: Button;
  readonly publicRadio: Button;
  readonly createBtn: Button;
  readonly pageHeading: Div;
  readonly successMessage: Div;
  readonly searchDrawerBtn: Button;
  readonly searchInput: Input;
  readonly closeDrawerBtn: Button;
  readonly actionsBtn: Button;
  readonly deactivateBtn: Button;
  readonly deactivateConfirmBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Pipeline List Page');

    this.createPipelineBtn = new Button(
      page,
      page.getByRole('button', { name: 'Create pipeline' }),
      'Create Pipeline Button'
    );

    this.pipelineNameInput = new Input(
      page,
      page.getByLabel('Pipeline name'),
      'Pipeline Name Input'
    );

    this.standardRadio = new Button(
      page,
      page.getByLabel('Standard'),
      'Standard Radio Button'
    );

    this.publicRadio = new Button(
      page,
      page.getByLabel('Public'),
      'Public Radio Button'
    );

    this.createBtn = new Button(
      page,
      page.getByRole('button', { name: 'Create', exact: true }),
      'Create Button'
    );

    this.pageHeading = new Div(
      page,
      page.getByRole('heading').first(),
      'Page Heading'
    );

    this.successMessage = new Div(
      page,
      page.getByText('Pipeline successfully created'),
      'Success Message'
    );

    this.searchDrawerBtn = new Button(
      page,
      page.getByText('search'),
      'Search Drawer Button'
    );

    this.searchInput = new Input(
      page,
      page.getByLabel('Search by name'),
      'Search Input'
    );

    this.closeDrawerBtn = new Button(
      page,
      page.getByText('close'),
      'Close Drawer Button'
    );

    this.actionsBtn = new Button(
      page,
      page.getByRole('button', { name: 'Actions' }),
      'Actions Button'
    );

    this.deactivateBtn = new Button(
      page,
      page.getByRole('button', { name: 'Deactivate pipeline' }),
      'Deactivate Pipeline Button'
    );

    this.deactivateConfirmBtn = new Button(
      page,
      page.getByRole('button', { name: 'Deactivate', exact: true }),
      'Deactivate Confirm Button'
    );
  }

  async expectLoaded() {
    await this.section('Expect Pipeline List page loaded', async () => {
      await this.createPipelineBtn.expectVisible();
    });
  }

  async navigateTo() {
    await this.section('Navigate to Pipelines', async () => {
      await this.page.getByRole('button', { name: 'Pipelines' }).click();
      await this.page.waitForURL(/\/pipelines/);
      await this.expectLoaded();
    });
  }

  async createPipeline(pipelineName: string): Promise<number> {
    let pipelineId = 0;
    
    await this.section(`Create pipeline: ${pipelineName}`, async () => {
      await this.createPipelineBtn.click();
      await this.pipelineNameInput.fill(pipelineName);
      await this.createBtn.click();
      await this.successMessage.expectVisible();

      // Extract pipeline ID from URL
      const newPipeline = new Link(this.page, this.page.getByRole('link', { name: pipelineName }), 'New Pipeline Record Link');
      await newPipeline.click();
      const url = this.page.url();
      const match = url.match(/\/pipelines\/(\d+)/);
      if (match) {
        pipelineId = parseInt(match[1], 10);
      }
    });

    return pipelineId;
  }

  async verifyPipelineHeading(pipelineName: string) {
    await this.section(`Verify pipeline heading: ${pipelineName}`, async () => {
      const heading = new Div(
        this.page,
        this.page.getByRole('heading', { name: pipelineName }),
        'Pipeline Heading'
      );
      await heading.expectVisible();
    });
  }

  async searchPipeline(pipelineName: string) {
    await this.section(`Search for pipeline: ${pipelineName}`, async () => {
      await this.searchDrawerBtn.click();
      await this.searchInput.fill(pipelineName);
      await this.closeDrawerBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickFirstPipelineLink() {
    await this.section('Click first pipeline link', async () => {
      const firstPipelineLink = new Link(
        this.page,
        this.page.locator('table.mat-table a.ng-star-inserted').first(),
        'First Pipeline Link'
      );
      await firstPipelineLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async navigateToPipeline(pipelineId: number) {
    await this.section(`Navigate to pipeline ID: ${pipelineId}`, async () => {
      const baseUrl = this.page.url().split('/pipelines')[0];
      await this.page.goto(`${baseUrl}/pipelines/${pipelineId}/in-pipeline`);
      await this.page.waitForLoadState('networkidle');
    });
  }

  async deactivatePipeline() {
    await this.section('Deactivate pipeline', async () => {
      await this.actionsBtn.click();
      await this.deactivateBtn.click();
      await this.deactivateConfirmBtn.click();
      
      const deactivateSuccessMsg = new Div(
        this.page,
        this.page.getByText('Pipeline successfully deactivated'),
        'Deactivate Success Message'
      );
      await deactivateSuccessMsg.expectVisible();
    });
  }
}
