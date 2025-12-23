import { Page } from "@playwright/test";import { BaseTest } from '@src/utils/base-test.util';import { BaseFlow } from "@src/utils/base-flow.util";
import { CandidateViewPage } from "@src/pages/ats/candidate/candidate-view.page";
import { PersonConfiguration } from "@src/pages/ats/candidate/person-configuration.page";
import { EmailCampaign } from "@src/pages/ats/communicate/email-campaign.page";
import { CommunicateMenu } from "@src/pages/common/navigation/communicate-menu.page";
import { NavigatorMenuPage } from "@src/pages/common/navigation/nav-menu.page";




export class EmailCampaignFlow extends BaseFlow {
  readonly personConfig: PersonConfiguration;
  readonly candidateViewPage: CandidateViewPage;
  readonly navigateMenu: NavigatorMenuPage;
  readonly communicateMenu: CommunicateMenu;
  readonly emailCampaign: EmailCampaign;


  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    // Access the current page via baseTest.page

    this.personConfig = new PersonConfiguration(page);
    this.candidateViewPage = new CandidateViewPage(page);
    this.navigateMenu = new NavigatorMenuPage(page);
    this.communicateMenu = new CommunicateMenu(page);
    this.emailCampaign = new EmailCampaign(page);
  }



  async createEmailCampaign(searchperson:string, email:string ,recipientName: string, campaignName: string, categorydesc: string) {
    await this.base.logger.section("Create an Email Campaign", async () => {
      await this.personConfig.searchPerson(searchperson);
      await this.candidateViewPage.emailUpdate(email);
      await this.navigateMenu.openNavigator();
      await this.navigateMenu.openCommunicate();
      await this.communicateMenu.openEmailCampaign();
      await this.emailCampaign.navigateToCreateCampaign(searchperson);
      await this.base.tabs.openPopupByClick(this.page, this.emailCampaign.saveRecipientListBtn, "Save Recipient List Tab", { timeout: 20000 });
      await this.base.tabs.switchTo("Save Recipient List Tab");
      const emailcampaigntab = this.base.tabs.as(EmailCampaign);
      await emailcampaigntab.saveAndCreateRecipient(recipientName);
      await this.emailCampaign.createCampaignWithDetails(recipientName, campaignName, categorydesc);
    });
  }

  async verifyEmailCampaignCreation() {
    await this.base.logger.section("Verify the created email campaign is successfull", async () => {
      await this.emailCampaign.verifySuccessMessage();
    });
  }

  async verifyEmailCampaignSchedule(recipientName: string, campaignName: string, categorydesc: string) {
    await this.base.logger.section("Verify the recurring scheduled email campaign", async () => {
      await this.emailCampaign.verifyUpcomingScheduledEmails(recipientName, campaignName, categorydesc);
    });
  }

}  