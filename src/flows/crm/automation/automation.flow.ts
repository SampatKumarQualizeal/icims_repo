import { Page } from '@playwright/test';

import { EmailSearchPage } from '@src/pages/crm/email/email-search.page';
import { AutomationListPage } from '@src/pages/crm/automation/automation-list.page';
import { CreateAutomationModalPage } from '@src/pages/crm/automation/create-automation-modal.page';
import { AutomationBuilderPage } from '@src/pages/crm/automation/automation-builder.page';
import { ActionSelectorMenu } from '@src/pages/crm/automation/action-selector-menu.page';
import { ModifyPipelinesModalPage } from '@src/pages/crm/automation/modify-pipelines-modal.page';
import { ArchiveAutomationModalPage } from '@src/pages/crm/automation/archive-modal.page';
import { CrmDashboardPage } from '@src/pages/crm/dashboard/dashboard.page';

export class AutomationFlow {
  readonly crmDashboard: CrmDashboardPage;
  readonly emailSearch: EmailSearchPage;
  readonly list: AutomationListPage;
  readonly createModal: CreateAutomationModalPage;
  readonly builder: AutomationBuilderPage;
  readonly actionMenu: ActionSelectorMenu;
  readonly modifyPipelinesModal: ModifyPipelinesModalPage;
  readonly archiveModal: ArchiveAutomationModalPage;

  constructor(private page: Page) {
    // EAGER LOAD — SINGLE INSTANCE FOR EACH PAGE OBJECT
    this.crmDashboard = new CrmDashboardPage(page);
    this.emailSearch = new EmailSearchPage(page);
    this.list = new AutomationListPage(page);
    this.createModal = new CreateAutomationModalPage(page);
    this.builder = new AutomationBuilderPage(page);
    this.actionMenu = new ActionSelectorMenu(page);
    this.modifyPipelinesModal = new ModifyPipelinesModalPage(page);
    this.archiveModal = new ArchiveAutomationModalPage(page);
  }

  async navToAutomations() {
    await this.crmDashboard.expectLoaded();
    await this.crmDashboard.goToSideNav('Email search');
    await this.emailSearch.expectLoaded();
    await this.emailSearch.goToAutomatedCampaigns();
    await this.list.expectLoaded();
    return this;
  }

  async createAutomation(name: string, pipeline?: string) {
    await this.list.openCreateAutomationModal();
    await this.list.clickEmptyAutomationOption();

    await this.createModal.expectLoaded();
    await this.createModal.fillName(name);

    if (pipeline) {
      await this.createModal.selectPipelineByVisibleText(pipeline);
    }

    await this.createModal.submit();
    await this.builder.expectLoadedWithName(name);
    return this;
  }

  async addAction(actionName: string, index = 0) {
    await this.builder.clickAdd(index);
    await this.actionMenu.choose(actionName);
    return this;
  }

  async modifyPipelines() {
    await this.modifyPipelinesModal.expectLoaded();
    await this.modifyPipelinesModal.save();
    return this;
  }

  async archiveAutomation() {
    await this.builder.openActionsMenu();

    await this.page.getByRole('button', {
      name: 'Archive automated campaign',
    }).click();

    await this.archiveModal.expectLoaded();
    await this.archiveModal.confirmArchive();

    return this;
  }
}
