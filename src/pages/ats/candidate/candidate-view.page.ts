import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';
import { Input } from '@src/components/input.component';


export class CandidateViewPage extends BasePage {
  
    readonly candidateTitle: Div;
    readonly candidateStatus: Div;
    readonly address : Div;
    readonly email: Div;
    readonly candidateUniqueID: Div;
    readonly resumeTabAsDefault: Button;
    readonly contactTab: Button;

    readonly contactTabAddressTypeValue: Div;
    readonly contactTabAddressStreetValue: Div;
    readonly contactTabAddressCityValue: Div;
    readonly contactTabAddressZipValue: Div;
    readonly contactTabAddressCountryValue: Div;
    readonly contactTabAddressStateValue: Div; 

    readonly contactTabPhoneTypeValue: Div;
    readonly contactTabPhoneNumberValue: Div;
    readonly profilePhoneDetails: Div;
    readonly profileAddressDetails: Div;

    readonly activityDetailsInLeftPannelLink: Link;
    readonly activityDropDownLinkValue: Link;
    readonly activityOptionSelect: Link;
    readonly activityDropdownBtnDiv: Div;
    readonly activityTitleText: Div;
    readonly activityCreatedByText: Div;
    readonly candidateTab : Button;
    readonly editbtn : Button;
    readonly candidateEmail : Input;
    readonly savebtn : Link;
    readonly moreBtn : Button;

  constructor(page: Page) {
    super(page, page.locator("//body"), 'Candidate Profile - Resume Tab');
    const frame = page.frameLocator('[data-testid="main-body-iframe"]');
    const frameleftpannel = frame.frameLocator("//iframe[@id='display_frame_left']");
    this.candidateTitle = new Div(this.page, frame.locator("//h1[@class='profile-card-title with-subtitle']"), 'Candidate Name Title');
    this.candidateStatus = new Div(this.page, frame.locator("//span[@class='label label-folder']"), 'Candidate Status');
    this.address = new Div(this.page, frame.locator("//address"), 'Candidate Address');
    this.email = new Div(this.page, frame.locator("//a[@title='Compose Email']"), 'Candidate Email');
    this.candidateUniqueID = new Div(this.page, frame.locator("//div[contains(@class,'profile-card-action-bar')]/small"), 'Candidate Unique ID');
    this.resumeTabAsDefault = new Button(this.page, frame.locator("//div[@id='tabsleft']/div[1]//button[@aria-selected='true'][@title='Resume']"), 'Resume Tab');
    this.contactTab = new Button(this.page, frame.locator("//div[@id='tabsleft']//button[@title='Contact']"), 'Contact Tab');
    this.candidateTab = new Button(this.page, frame.locator("//button[contains(text(),'Custom Candidate Tab for Name And Stuff')]"),"Custom Candidate Tab for name and email details");
    this.editbtn = new Button(this.page,frameleftpannel.locator("//a[@id='EDIT_anchor']"),'Edit Button');
    this.contactTabAddressTypeValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'addressCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr[1]//td[1])[1]/div"), 'Contact Tab Address Type Value');
    this.contactTabAddressStreetValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'addressCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr[1]//td[1])[2]//div[1]"), 'Contact Tab Address Street Value');
    this.contactTabAddressCityValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'addressCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr[1]//td[1])[2]//div[2]/span[contains(@id,'City')]"), 'Contact Tab Address City Value');
    this.contactTabAddressZipValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'addressCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr[1]//td[1])[2]//div[2]/span[contains(@id,'Zip')]"), 'Contact Tab Address Zip Value');
    this.contactTabAddressCountryValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'addressCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr[1]//td[1])[2]//div[3]"), 'Contact Tab Address Country Value');
    this.contactTabAddressStateValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'addressCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr[1]//td[1])[2]//div[2]/span[contains(@id,'State')]"), 'Contact Tab Address State Value');

    this.contactTabPhoneTypeValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'phoneCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr//td)[1]"), 'Contact Tab Phone Type Value');
    this.contactTabPhoneNumberValue = new Div(this.page, frameleftpannel.locator("(//td[contains(@class,'phoneCollection')]//table[contains(@class,'ContactInfo')]//tbody/tr//td)[2]/div"), 'Contact Tab Phone Number Value');

    this.profileAddressDetails = new Div(this.page, frame.locator("//div[contains(@class,'profile-card')]//ul[contains(@class,'contact-info')]//li//address"), 'Profile Address Details');
    this.profilePhoneDetails = new Div(this.page, frame.locator("//div[contains(@class,'profile-card')]//ul[contains(@class,'contact-info')]//li//phone"), 'Profile Phone Details');

    this.activityDetailsInLeftPannelLink = new Link(this.page, frame.locator("//li[@id='activity-tab']/a"), 'Activity Details Left Pannel Tab');
    this.activityDropDownLinkValue = new Link(this.page, frame.locator("//button[@id='activityFilterDropdown']/span[text()='All Activities']"), 'Activity DropDown Link');
    this.activityOptionSelect = new Link(this.page, frame.locator("//button[@id='activityFilterDropdown']/..//ul/li//a[text()='All Activities']"), 'Activity Option Select Link');
    this.activityDropdownBtnDiv = new Div(this.page, frame.locator("//button[@id='activityFilterDropdown']/.."), 'Activity Dropdown Link Button');  
    this.activityTitleText = new Div(this.page, frame.locator("//div[contains(@class,'activity glyphCard ')]//div[@id='activityItem']//div[contains(@class,'activityTitle')][text()='Profile Created']"), 'Activity Text');  
    this.activityCreatedByText = new Div(this.page, frame.locator("//div[contains(@class,'activity glyphCard ')]//div[contains(@class,'activityHeader')]//div[text()='Profile Created']/../following-sibling::div//div[contains(@class,'activityBy')]"), 'Activity Created By');  
    this.candidateEmail = new Input(this.page,frameleftpannel.locator("//input[@id='PersonProfileFields.Email']"),'Candidate email input field');
    this.savebtn = new Link(this.page, frameleftpannel.locator("//a[@id='saveButton_anchor']"),"Save Button");
    this.moreBtn = new Button(this.page , frame.locator("//span[text()='More']/.."),"More Button");
  }

  async expectLoaded() {
    await this.section('Resume Tab - verify loaded', async () => {
      await this.expectVisible();
    });
  }

  async verifyTitle(text: string) {
    await this.section('Verify Candidate title', async () => {
      await this.candidateTitle.expectTextContains(text);
    });
  }

  async VerifyAddressContains(text: string) {
    await this.section('Verify Candidate address', async () => {
      await this.address.expectTextContains(text);
    });
  }

  async verifyEmail(text: string) {
    await this.section('Verify Candidate email', async () => {
      await this.email.expectTextContains(text);
    });
  }

  async verifyFolder(text: string) {
    await this.section('Verify Candidate Folder', async () => {
      await this.candidateStatus.expectTextContains(text);
    });
  }

  async verifyFullName(firstName: string) {
    await this.section('Verify Candidate Full Name', async () => {
      await this.candidateTitle.expectTextContains(firstName);
    } );
  }


  async verifyCandidateUniqueIDIsPresent()
  {
    await this.section('Verify Candidate Unique ID is present', async () => {
      await this.candidateUniqueID.expectVisible();
    });
  }

  async verifyUploadedResumeDetails(Array: Array<{
    type: string;
    street: string;
    city: string;
    zip: string;
    country: string;
    state: string;
}> , phoneType: string, phoneNumber: string, phoneExtension: string ) {
    await this.section('Verify Uploaded Resume Details', async () => {
      await this.resumeTabAsDefault.expectVisible();
    });

    await this.section('Navigate to Contact Tab and verify', async () => {
      await this.contactTab.click();
      await this.contactTabAddressCityValue.scrollIfNeeded();
      await this.contactTabAddressCityValue.expectTextContains(Array[0].city);  
      await this.contactTabAddressCountryValue.expectTextContains(Array[0].country);
      await this.contactTabAddressStateValue.expectTextContains(Array[0].state);
      await this.contactTabAddressStreetValue.expectTextContains(Array[0].street);
      await this.contactTabAddressZipValue.expectTextContains(Array[0].zip);
      await this.contactTabAddressTypeValue.expectTextContains(Array[0].type);
      //verify phone details in contact tab
      await this.contactTabAddressCityValue.scrollIfNeeded();
      await this.contactTabPhoneTypeValue.expectTextContains(phoneType);
      await this.contactTabPhoneNumberValue.expectTextContains(phoneNumber);
      await this.contactTabPhoneNumberValue.expectTextContains(phoneExtension);
      
    });

    await this.section('Verify Address And Phone Details on Profile Left Pannel', async () => {
      // verify phone details in left pannel

      await this.profilePhoneDetails.expectTextContains(phoneNumber);
      await this.profilePhoneDetails.expectTextContains(phoneExtension);

      //add code to verify the address details in the profile left pannel

      this.profileAddressDetails.expectTextContains(Array[0].city);
      this.profileAddressDetails.expectTextContains(Array[0].country);
      this.profileAddressDetails.expectTextContains(Array[0].state);
    });


    await this.section('Verify activity details in left pannel', async () => { 
      if(!await this.activityDropDownLinkValue.isPresent())
      {
        await this.activityDropdownBtnDiv.click();
        await this.activityOptionSelect.click();
      }
        await this.activityCreatedByText.scrollIfNeeded();
        await this.activityTitleText.verifyTextContains("Profile Created");
        //provide the created by details here using the login name
        await this.activityCreatedByText.verifyTextContains("Recruit");
    });
  }


  async emailUpdate(email: string)
  {
     try {
      await this.verifyEmail(email); 
     } catch (error) {
      try {
        await this.candidateTab.click(); 
      } catch (error) {
        await this.moreBtn.click();
        await this.page.pause();
        await this.candidateTab.click();
      }
      await this.editbtn.click();
      //await this.candidateEmail.fill("");
      await this.candidateEmail.fill(email);
      await this.page.waitForTimeout(2000);
      await this.savebtn.click();
     }

  }
}