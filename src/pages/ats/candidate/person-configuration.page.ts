import { Page } from "@playwright/test";
import { BasePage } from "@src/pages/base.page"
import { Button } from "@src/components/button.component";
import { Link } from "@src/components/link.component";
import { Input } from "@src/components/input.component";
import { Dropdown } from "@src/components/dropdown.component";
import { Div } from "@src/components/div.component";




export class PersonConfiguration extends BasePage{

    mainframe: any = null;
    profileleftframe: any = null;
    leftframe:any = null;

    readonly systemBtn: Button;
    readonly personBtn: Button;
    readonly contactBtn: Button;
    readonly contactBtn1: Button;
    readonly addNewFieldGroupLink : Link;
    readonly addLabeltogroupinput: Input;
    readonly selectfieldgrouptypedropdown: Dropdown;
    readonly addBtn : Button;
    addNewFieldBtn : Button | undefined;
    readonly addLabeltofieldinput: Input;
    readonly selectfielddropdown:Dropdown;
    readonly saveBtn: Button;
    readonly quicksearchDropDown: Button;
    readonly quicksearchtypeselect: Button;
    readonly quicksearchinput : Input;
    readonly personSearchList: Link;
    readonly editBtn:Button;
    fieldgroupsection: Div | undefined;
    fieldgroupsectionNewbtn: Button | undefined;
    readcheckboxinput: Input | undefined;
    hidecheckboxinput: Input | undefined;
    readonly viewMorePersonbtn : Button;
    fieldgroupoptionslink: Link | undefined;
    readonly deletelink: Link;
    readonly deletconfirmcheckbox : Input;
    readonly deletebtn : Button;
    //readonly searchList : Link;


    constructor(page: Page)
    {
        super(page,page.locator('//body'),"Person - Configuration Check");
        this.mainframe = page.frameLocator('[data-testid="main-body-iframe"]');
        this.profileleftframe = this.mainframe.frameLocator("//iframe[@id='configContentIFrame']");
        this.leftframe = this.mainframe.frameLocator("//iframe[@id='display_frame_left']");
        this.systemBtn = new Button(page,this.mainframe.locator("//span[text()='System']/.."),'System Button');
        this.personBtn = new Button(page,this.profileleftframe.locator("//li[contains(text(),'Company')]/following-sibling::li[contains(text(),'Person')]"),'Person Button');
        this.contactBtn = new Button(page,this.profileleftframe.locator("//div/span[text()='Contact']/.."),'Contact Button');
        this.contactBtn1 = new Button(page,this.mainframe.locator("//button[@id='PS_CONTACT']"),'Contact Button');
        this.addNewFieldGroupLink = new Link(page,this.profileleftframe.locator("//div[contains(text(),'Contact Information')]/../following-sibling::div//a[@title='Add New Field Group to Section']"),"New Field Group Add Link");
        this.addLabeltogroupinput = new Input(page,this.profileleftframe.locator("//table[@id='field_New0_NewFieldInputs']//input[contains(@id,'NewFieldLabel')]"),'Field Group Label field');
        this.selectfieldgrouptypedropdown = new Dropdown(page,this.profileleftframe.locator("//select[@id='field_New0_NewFieldGroupType']"),'Field Group Select');
        this.addBtn = new Button(page,this.profileleftframe.locator("(//span[text()='Cancel']/../../following-sibling::div/button/span[text()='Add']/..)[1]"),'Add Button');
        this.addLabeltofieldinput = new Input(page,this.profileleftframe.locator("//input[@id='field_New0_NewFieldLabel']"),'Label to Field Added To Field Group');
        this.selectfielddropdown = new Dropdown(page,this.profileleftframe.locator("//select[@id='field_New0_NewFieldType']"),'Select option for the field');
        this.saveBtn = new Button(page,this.profileleftframe.locator("//button[@id='saveButton']"),'Save Button');
        this.quicksearchDropDown = new Button(page,page.locator("//button[@id='quicksearch-menu-button']"),'Dropdown to select Type');
        this.quicksearchtypeselect = new Button(page,page.locator("//li[@id='quicksearch_contact']"),'select option');
        this.quicksearchinput = new Input(page, page.locator("//input[@placeholder='Quick search...']"),'Quick search input box');
        this.personSearchList = new Link(page,this.mainframe.locator("//table[contains(@id,'searchResultsGridTable')]//tbody/tr/td//a[contains(@onclick,'Person')]").first(),'Accessing the first element');
        this.editBtn = new Button(page,this.leftframe.locator("//a[@id='EDIT_anchor']"),'Edit Btn in contact tab');
        this.viewMorePersonbtn = new Button(page,page.locator("//div[contains(text(),'View')]/.."),'View more button');
        this.deletelink = new Link(page,this.profileleftframe.locator("//ul//a[@title='Delete Field']"),'Delete link');
        this.deletconfirmcheckbox = new Input(page, this.profileleftframe.locator("//input[@id='confirmDeleteCheckbox']"),'Confirm Delete Checkbox');
        this.deletebtn = new Button(page,this.profileleftframe.locator("//span[text()='Delete']/..").first(),'Delete button');
        //this.searchList = new Link(page,page.locator("//div[contains(text(),'View')]/../../li").count(),"Available List options for person search");
    }



    async navigateToSystemPersonContact()
    {
        await this.systemBtn.click();
        await this.personBtn.click();
        await this.contactBtn.click();
    }

    async addNewFiledGroup(fieldGroupLabel: string)
    {
        await this.addNewFieldGroupLink.scrollIfNeeded();
        await this.addNewFieldGroupLink.click();
        await this.addLabeltogroupinput.fill(fieldGroupLabel);
        await this.selectfieldgrouptypedropdown.select("collection");
        await this.addBtn.click();
        await this.saveBtn.click();
        await this.page.waitForTimeout(5000);
    }


    async addFieldsToFieldGroup(fieldGroupLabel: string , fieldLabel: string)
    {
        const addFieldxpath = `//input[@value='${fieldGroupLabel}']/../../../following-sibling::tr//a`;
        this.addNewFieldBtn = new Button(this.page,this.profileleftframe.locator(addFieldxpath),"Add New Field");
        await this.addNewFieldBtn.scrollIfNeeded();
        await this.addNewFieldBtn.click();
        await this.addLabeltofieldinput.fill(fieldLabel);
        await this.selectfielddropdown.select(fieldLabel);
        await this.addBtn.click();
        await this.saveBtn.click();
        await this.page.waitForTimeout(8000);
    }

    async searchPerson(personName: string){
        await this.quicksearchDropDown.click();
        await this.page.waitForTimeout(2000);
        await this.quicksearchtypeselect.click();
        await this.quicksearchinput.fill("");
        await this.quicksearchinput.type(personName);
        await this.page.waitForTimeout(2000);
        const count = await this.page.locator("//div[contains(text(),'View')]/../../li").count();
        if (count > 2) {
            await this.viewMorePersonbtn.click();
            await this.page.waitForTimeout(2000);
            await this.personSearchList.click();
        } else if (count === 2) {
            await this.viewMorePersonbtn.click();   
        } else if (count === 0)
        {
            throw new Error("Search has returned no results");
        }

        
    }


    async navigateToPersonAndVerify(personName:string , fieldGroupLabel:string , access:string): Promise<boolean>
    {
        let flag: boolean = false;
        await this.searchPerson(personName);
        await this.contactBtn1.click();
        await this.editBtn.click();
        const fieldgroup = `//td/div//label/span[text()='${fieldGroupLabel}']`;
        const fieldgroupnewbtn = `//button[contains(@title,'${fieldGroupLabel}')][text()='New']`;
        this.fieldgroupsection = new Div(this.page,this.leftframe.locator(fieldgroup),'Field grop presence in object used');
        this.fieldgroupsectionNewbtn = new Button(this.page,this.leftframe.locator(fieldgroupnewbtn),'New button');
        if (access.toLowerCase() === 'edit') {
            if (await this.fieldgroupsection.isPresent()) {
                await this.fieldgroupsection.scrollIfNeeded();
                await this.fieldgroupsectionNewbtn.isEnabled(); 
                flag = true;  
            }
        } else if (access.toLowerCase() === 'read'){
            if (await this.fieldgroupsection.isPresent()) {
                await this.fieldgroupsection.scrollIfNeeded();
                await this.fieldgroupsectionNewbtn.waitFor('disabled'); 
                flag = !await this.fieldgroupsectionNewbtn.isEnabled();  
            }
        }else if (access.toLowerCase() === 'hide' || access.toLowerCase() === 'delete'){
                await this.fieldgroupsection.verifyNotExists();
                flag = true;
        }
        return flag;
    }


    async scrollToTheCreatedFieldGroupToUpdateAccess(fieldGroupLabel:string , accessUpdate:string)
    {
        // accessupdates value must be 'read' , 'hide'
        const readcheckbox = `(//input[@value='${fieldGroupLabel}']/../../following-sibling::td//input[@type='checkbox'])[3]`;
        const hidecheckbox = `(//input[@value='${fieldGroupLabel}']/../../following-sibling::td//input[@type='checkbox'])[1]`;
        const optDropdown = `//input[@value='${fieldGroupLabel}']/../../following-sibling::td//a[@title='Actions']`;

        this.readcheckboxinput = new Input(this.page,this.profileleftframe.locator(readcheckbox),'Read checkbox');
        this.hidecheckboxinput = new Input(this.page,this.profileleftframe.locator(hidecheckbox),'Hide checkbox');
        this.fieldgroupoptionslink = new Link(this.page, this.profileleftframe.locator(optDropdown),'Dropdown');

        if (accessUpdate.toLowerCase() === 'read') {
            await this.readcheckboxinput.scrollIfNeeded();
            await this.readcheckboxinput.click();
            await this.saveBtn.click();
        } else if (accessUpdate.toLowerCase() === 'hide'){
            await this.hidecheckboxinput.scrollIfNeeded();
            await this.readcheckboxinput.click();
            await this.hidecheckboxinput.click();
            await this.saveBtn.click();
        } else if (accessUpdate.toLowerCase() === 'delete') {
            await this.hidecheckboxinput.scrollIfNeeded();
            await this.fieldgroupoptionslink.click();
            await this.deletelink.click();
            await this.deletconfirmcheckbox.click();
            await this.deletebtn.click();
            await this.saveBtn.click();
        }

    }
}