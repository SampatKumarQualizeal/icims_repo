import { Page } from "@playwright/test";
import { Button } from "@src/components/button.component";
import { Div } from "@src/components/div.component";
import { Dropdown } from "@src/components/dropdown.component";
import { Input } from "@src/components/input.component";
import { Link } from "@src/components/link.component";
import { BasePage } from "@src/pages/base.page";
import { link } from "fs";
import { receiveMessageOnPort } from "worker_threads";



export class EmailCampaign extends BasePage {

    mainframe: any = null;
    contentFrame: any = null;
    bodyFrame: any = null;

    readonly createRecipientListBtn: Button;
    readonly personButton : Button;
    readonly recruitingWorkflowButton : Button;
    readonly sourcingWorkflowButton : Button;
    readonly recipientListTab : Link;
    readonly searchInput : Input;
    readonly searchBtn : Link;
    readonly previewWaterMark : Div;
    readonly saveRecipientListBtn : Button;
    readonly newTitle : Input;
    readonly saveCreateCampaign : Button;
    readonly recipientlistSelectedValue : Dropdown;
    readonly inputCampaignName: Input;
    readonly campaingCategoryDropdown : Dropdown;
    readonly configEmailBtn : Button;

    readonly templateDDLink : Link;
    readonly inputSubject : Input;
    readonly addVariableDD : Button;
    readonly recipientOptionDiv : Div;
    readonly candidateExpansionDiv : Div;
    readonly firstNamediv : Div;
    readonly addSelectedButton : Button;
    readonly templatetype : Link;
    readonly templateBodyWithFirstName : Div;
    readonly scheduleBtn : Button;
    readonly emailIntervalDropdown : Dropdown;
    readonly finishBtn : Button;
    readonly successMessage : Div;
    readonly upcomingScheduleLink : Link;
    readonly categoryDD : Dropdown;
    readonly campaingDD : Dropdown;
    

    constructor(page: Page) {
        super(page, page.locator('body'), 'Email Campaign Page');
        this.mainframe = page.frameLocator('[data-testid="main-body-iframe"]');
        this.contentFrame = this.mainframe.frameLocator("//iframe[@id='contentFrame']");
        this.bodyFrame = this.contentFrame.frameLocator("#body_html_ifr");
        this.createRecipientListBtn = new Button(this.page, this.contentFrame.locator('//button[@id="createRecipientListBtn"]'), 'Create Recipient List Button');
        this.personButton = new Button(this.page, this.mainframe.locator("//button[@id='Person-button']"),"Person Button");
        this.recruitingWorkflowButton = new Button(this.page, this.mainframe.locator("//button[@id='Submittal-button']"),"Recruiting Workflow  Button");
        this.sourcingWorkflowButton = new Button(this.page, this.mainframe.locator("//button[@id='Profile9-button']"),"Sourcing workflow Button");
        this.recipientListTab = new Link(this.page,this.mainframe.locator("//a[@id='showRecipientLists']"),"Recipient List Tab");
        this.searchInput = new Input(this.page,this.contentFrame.locator("//input[@id='keywordsSmall']"),"Search Input Box");
        this.searchBtn = new Link(this.page,this.contentFrame.locator("//a[@id='searchSubmitButton_anchor']"),"Search Button");
        this.previewWaterMark = new Div(this.page,this.contentFrame.locator("//img[contains(@class,'previewWatermark')]/.."),"Preview Water Mark");
        this.saveRecipientListBtn = new Button(this.page,this.contentFrame.locator("//button[@id='saveListBtn']"),"Save Recipient List");
        this.newTitle = new Input(this.page, page.locator("//input[@id='newtitle']"),"New Title");
        this.saveCreateCampaign = new Button(this.page,page.locator("//button[@id='continueBtn']"),"Save And Create Campaign");
        this.recipientlistSelectedValue = new Dropdown(this.page,this.contentFrame.locator("//select[@id='recipientListIdSelect']"),"Recipient list saved dropdown");
        this.inputCampaignName = new Input(this.page,this.contentFrame.locator("//input[@id='campaignName']"),"Campaign Name");
        this.campaingCategoryDropdown = new Dropdown(this.page,this.contentFrame.locator("//select[@id='categoryIdSelect']"),"Campaign Category Drowdown");
        this.configEmailBtn = new Button(this.page , this.contentFrame.locator("//button[@id='configBtn']"),"Configure Email Button");
        this.templateDDLink = new Link(this.page,this.contentFrame.locator("//a[@id='templateSelect_icimsDropdown']"),"Template Dropdown Link");
        this.inputSubject = new Input(this.page,this.contentFrame.locator("//input[@id='subject']"),"Email Subject");
        this.addVariableDD = new Button(this.page,this.contentFrame.locator("//button[@id='variableIcon-open']"),"Add Variable Manual DD");
        this.recipientOptionDiv = new Div(this.page,this.contentFrame.locator("//div[@pickerid='Recipient']"),"Recipient Option");
        this.candidateExpansionDiv = new Div(this.page,this.contentFrame.locator("//div[text()='Custom Candidate Tab for Name And Stuff Tab']").first(),"Candidate Tab Expansion to select First name");
        this.firstNamediv = new Div(this.page , this.contentFrame.locator("//div[text()='First Name']").first(),"First Name Option");
        this.addSelectedButton = new Button(this.page , this.contentFrame.locator("//span[text()='Add Selected']/..").first(),"Add Selected Button");
        this.templatetype = new Link(this.page,this.contentFrame.locator("//ul[@id='result-group_templateSelect_0']/li[@title='Newsletter with footer icon']"),"News Letter with Footer Icon");
        this.templateBodyWithFirstName = new Div(this.page,this.bodyFrame.locator("//td[@class='companyAddress']/span[contains(text(),'First Name')]"),"Template Body having FirstName field");
        this.scheduleBtn = new Button(this.page , this.contentFrame.locator("//button[@id='scheduleButton']"),"Schedule Button");
        this.emailIntervalDropdown = new Dropdown(this.page,this.contentFrame.locator("//select[@id='recurrenceInterval']"),"Email Interval Dropdown to select Daily");
        this.finishBtn = new Button(this.page,this.contentFrame.locator("//button[@id='scheduleBtn']"),"Finish Button");
        this.successMessage = new Div(this.page,this.contentFrame.locator("//div[@class='successMessage'][contains(text(),'successfully scheduled')]"),"Success Message");
        this.upcomingScheduleLink = new Link(this.page,this.mainframe.locator("//a[@id='showUpcomingSchedule']"),"Upcoming Schedule Tab");
        this.categoryDD = new Dropdown(this.page,this.contentFrame.locator("//select[@id='campaignCategory']"),"Category selection dropdown");
        this.campaingDD = new Dropdown(this.page, this.contentFrame.locator("//select[@id='campaigns']"),"Campaign Dropdown"); 
    }

    async clickRecipientsListTab()
    {
        await this.recipientListTab.click();
    }

    async clickCreateRecipientListButton(){ 
        await this.createRecipientListBtn.click();
    }

    // below three methods are to click the pop up button seen after clicking create recipient list button

    async clickPersonButton()
    {
        await this.personButton.click();
    }

    async clickRecruitingWorkFlow()
    {
        await this.recruitingWorkflowButton.click();
    }

    async clickSourcingWorkFlow()
    {
        await this.sourcingWorkflowButton.click();
    }

    async inputSearchValue(value:string)
    {
        await this.searchInput.type(value);
    }

    async clickSearchBtn()
    {
        await this.searchBtn.click();
    }

    async verifyWaterMark()
    {
        await this.previewWaterMark.isVisible();
    }

    async clickSaveRecipientsListButton()
    {
        await this.saveRecipientListBtn.click();
    }

    async navigateToCreateCampaign(searchValue:string)
    {
        await this.clickRecipientsListTab();
        await this.clickCreateRecipientListButton();
        await this.clickPersonButton();
        await this.page.waitForTimeout(2000);
        await this.inputSearchValue(searchValue);
        await this.page.waitForTimeout(2500);
        await this.clickSearchBtn();
        await this.page.waitForTimeout(2000);
        await this.verifyWaterMark();
        await this.clickSaveRecipientsListButton();
    }

    async saveAndCreateRecipient(title:string)
    {
        await this.newTitle.type(title);
        await this.saveCreateCampaign.click();
    }

    async createCampaignWithDetails(recipientName :string , campaignName :string , category:string){ 

        await this.inputCampaignName.fill(campaignName);
        await this.campaingCategoryDropdown.select(category);
        await this.recipientlistSelectedValue.select(recipientName);
        await this.configEmailBtn.click();


        //step 2 : create campaign 
        await this.page.waitForTimeout(2000);
        await this.templateDDLink.click();
        await this.page.waitForTimeout(1000);
        await this.templatetype.click();

        await this.addVariableDD.click();
        await this.recipientOptionDiv.click();
        await this.candidateExpansionDiv.click();
        await this.firstNamediv.click();
        await this.addSelectedButton.click();
        await this.templateBodyWithFirstName.scrollIfNeeded();
        await this.templateBodyWithFirstName.isPresent();
        await this.scheduleBtn.click();

        //step 3 : create campaign 

        await this.emailIntervalDropdown.select("Daily");
        await this.finishBtn.click();

    }

    async verifySuccessMessage(){
        //check confirmation message 
        await this.page.waitForTimeout(2000);
        await this.successMessage.isVisible();
    }

    async verifyUpcomingScheduledEmails(recipientName:string,campaignName:string,categorydesc:string )
    {
        await this.upcomingScheduleLink.click();
        await this.categoryDD.select(categorydesc);
        await this.campaingDD.select(campaignName);
        const campainLoc = `//table[contains(@id,'UpcomingScheduleData')]//td/div[text()='${campaignName}']`;
        const recipientLoc = `//table[contains(@id,'UpcomingScheduleData')]//td/div[text()='${recipientName}']`;
        await this.page.waitForTimeout(2000);
        const ccount = await this.contentFrame.locator(campainLoc).count();
        const rcount = await this.contentFrame.locator(recipientLoc).count();
        if (!((ccount === 5) && (rcount ===5))) {
            throw new Error("Scheduled email Count are not matched");
        }
    }
}