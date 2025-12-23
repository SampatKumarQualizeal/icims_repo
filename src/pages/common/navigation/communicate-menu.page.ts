import { Locator, Page } from "@playwright/test";
import { Button } from "@src/components/button.component";
import { Link } from "@src/components/link.component";
import { BasePage } from "@src/pages/base.page";


export class CommunicateMenu extends BasePage {
  readonly emailCampaignLink: Link;
  

  constructor(page: Page) {
    super(page, '[data-testid=\"create-menu-root\"]', 'Create Menu');

    // STEP 3: Resolve element locators inside #main_body automatically
    const emailCampaignLoc: Locator = this.page.locator("//a[contains(@href,'EmailCampaign')]");
    

    // STEP 4: Instantiate components
    this.emailCampaignLink = new Link(page, emailCampaignLoc, 'Navigator → Communicate -> Email Campaign');

  }


  //compose email 


  //schedule appointment

  //create task

  //create/manage email campaigns

  async openEmailCampaign()
  {
    await this.emailCampaignLink.click();
  }


  //create/manage events


  //view calendar


  //view platform announcements 




  
}