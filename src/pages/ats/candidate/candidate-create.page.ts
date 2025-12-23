import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { FileInput } from '@src/components/fileinput.component';
import { BasePage } from '@src/pages/base.page';
import { Div } from '@src/components/div.component';
import { Input } from '@src/components/input.component';
import { Dropdown } from '@src/components/dropdown.component';
import { table } from 'node:console';
import { TabManager } from '@src/components/tab-manager.component';
import { BaseTest } from '@src/utils/base-test.util';
import { Link } from '@src/components/link.component';


export class CandidateCreatePage extends BasePage {
    readonly nextBtn: Button;
    readonly resumeUpload: FileInput;
    readonly resumeTextBlock: Div;
    readonly firstNameInput: Input;
    readonly lastNameInput: Input;
    readonly emailInput: Input;
    readonly folderDropdown: Dropdown;
    readonly newPhonesButton: Button;
    readonly phonesCollection: Div;
    readonly newAddressButton: Button;
    readonly addressesCollection: Div;
    readonly newProfessionalExperienceButton: Button;
    readonly professionalExperienceCollection: Div;
    readonly educationCollection: Div;
    readonly newEducationButton: Button;
    readonly finishButton: Button;
    readonly continueAnywayButton: Button;
    readonly enteredphoneType: Input;
    readonly enteredphoneNumber: Input;
    readonly enteredphoneExtension: Input;

    readonly addresstypeDropdown: Dropdown;
    readonly streetInput: Input;
    readonly cityInput: Input;
    readonly zipInput: Input;
    readonly countryDropdown: Dropdown;
    readonly stateDropdown: Dropdown;
    readonly countyInput: Input;
    readonly okButton: Button;
    readonly enteredAddressType: Div;
    readonly enteredAddressStreet: Div;
    readonly enteredAddressCity: Div;
    readonly enteredAddressZip: Div;
    readonly enteredAddressCountry: Div;
    readonly enteredAddressState: Div;
    readonly enteredAddressCounty: Div;


    readonly currencyDropdown: Dropdown;
    readonly salaryInput: Input;
    readonly profilecreatedpageDiv: Div
    readonly emailCheckLink: Link;




    constructor(page: Page) {
        super(page, page.locator("//h1[.='Create Candidate']"), 'Candidate Create - Resume Tab');
        //const frame = page.locator('[data-testid="main-body-iframe"]').contentFrame();
        const frame = page.frameLocator('[data-testid="main-body-iframe"]');
        this.nextBtn = new Button(page, frame.locator("#nextButton"), 'Resume Tab - Next Button');
        this.resumeUpload = new FileInput(this.page, frame.locator('#resumeUploadInput'), 'Resume Upload');
        this.resumeTextBlock = new Div(this.page, frame.locator('#resumeText'), 'Parsed Resume Text Block');
        this.firstNameInput = new Input(this.page, frame.getByRole('textbox', { name: 'First Name*' }), 'First Name Input');
        this.lastNameInput = new Input(this.page, frame.getByRole('textbox', { name: 'Last Name*' }), 'Last Name Input');
        this.emailInput = new Input(this.page, frame.getByRole('textbox', { name: 'Email*' }), 'Email Input');
        this.folderDropdown = new Dropdown(this.page, frame.getByLabel('Folder'), 'Folder Dropdown');
        this.newPhonesButton = new Button(this.page, frame.locator("//button[@title='Create New Phones']"), 'New Phone Button');
        this.phonesCollection = new Div(this.page, frame.locator('#PersonProfileFields.Phones'), 'Phones Collection');
        this.newAddressButton = new Button(this.page, frame.locator("//button[@title='Create New Addresses']"), 'New Address Button');
        this.addressesCollection = new Div(this.page, frame.locator('#PersonProfileFields.Addresses'), 'Addresses Collection');
        this.newProfessionalExperienceButton = new Button(this.page, frame.locator("//button[@title='Create New Professional Experience']"), 'New Professional Experience Button');
        this.professionalExperienceCollection = new Div(this.page, frame.locator("//div[@fieldlabel='Professional Experience']"), 'Professional Experiences Collection');
        this.newEducationButton = new Button(this.page, frame.locator("//button[@title='Create New Education']"), 'New Education Button');
        this.educationCollection = new Div(this.page, frame.locator('#CandProfileFields.Education'), 'Education Collection');
        this.finishButton = new Button(this.page, frame.locator("//a[contains(@id,'finishButton')]"), 'Finish Button');
        this.continueAnywayButton = new Button(this.page, frame.locator("//button/span[.='Continue Anyway']/parent::button"), 'Continue Anyway Button');
        this.enteredphoneType = new Input(this.page, frame.locator("//div[@fieldlabel='Phones']//td[contains(@id,'PersonProfileFields.PhoneType')][@class='fieldData']//div"), 'Entered Phone Type');
        this.enteredphoneNumber = new Input(this.page, frame.locator("//div[@fieldlabel='Phones']//td[contains(@id,'PersonProfileFields.PhoneNumber')][@class='fieldData']//div"), 'Entered Phone Number');
        this.enteredphoneExtension = new Input(this.page, frame.locator("//div[@fieldlabel='Phones']//td[contains(@id,'PersonProfileFields.PhoneExtension')][@class='fieldData']//div"), 'Entered Phone Extension');


        this.addresstypeDropdown = new Dropdown(this.page, frame.locator("//select[@id='PersonProfileFields.AddressType']"), 'Address Type Dropdown');

        this.streetInput = new Input(this.page, frame.getByRole('textbox', { name: 'Street' }), 'Street Input');
        this.cityInput = new Input(this.page, frame.getByRole('textbox', { name: 'City' }), 'City Input');
        this.zipInput = new Input(this.page, frame.getByRole('textbox', { name: 'Zip' }), 'Zip Input');
        this.countryDropdown = new Dropdown(this.page, frame.getByLabel('Country'), 'Country Dropdown');
        this.stateDropdown = new Dropdown(this.page, frame.getByLabel('State/Province'), 'State Dropdown');
        this.countyInput = new Input(this.page, frame.getByRole('textbox', { name: 'County' }), 'County Input');
        this.okButton = new Button(this.page, frame.locator("//button//span[text()='OK']/.."), 'OK Button');

        this.enteredAddressType = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressType')][@class='fieldData']//div"), 'Entered Address Type');
        this.enteredAddressStreet = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressStreet')][@class='fieldData']//div"), 'Entered Address Street');
        this.enteredAddressCity = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressCity')][@class='fieldData']//div"), 'Entered Address City');
        this.enteredAddressZip = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressZip')][@class='fieldData']//div"), 'Entered Address Zip');
        this.enteredAddressCountry = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressCountry')][@class='fieldData']//div"), 'Entered Address Country');
        this.enteredAddressState = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressState')][@class='fieldData']//div"), 'Entered Address State');
        this.enteredAddressCounty = new Div(this.page, frame.locator("//div[@fieldlabel='Addresses']//td[contains(@id,'PersonProfileFields.AddressCounty')][@class='fieldData']//div"), 'Entered Address County');

        this.currencyDropdown = new Dropdown(this.page, frame.locator("//select[contains(@id,'Currency')]"), 'Currency Dropdown');
        this.salaryInput = new Input(this.page, frame.locator("//label[contains(@id,'Amount')]/../input"), 'Salary Input');
        this.profilecreatedpageDiv = new Div(this.page, frame.locator("//div[@id='profile-frame']"), "Profile Created Page Div");
        this.emailCheckLink = new Link(this.page, frame.locator("//a[@title='Compose Email']"), "Email Check Link");
    }

    async expectLoaded() {
        await this.section('Resume Tab - verify loaded', async () => {
            await this.expectVisible();
        });
    }

    async fillFirstName(firstName: string) {
        await this.firstNameInput.fill(firstName);
    }

    async fillLastName(lastName: string) {
        await this.lastNameInput.fill(lastName);
    }
    async fillEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async selectFolder(folderName: string) {
        await this.folderDropdown.pickByText(folderName);
    }

    async uploadResume(path: string) {
        await this.resumeUpload.setFiles(path);
    }

    async expectParsedTextContains(text: string) {
        await this.resumeTextBlock.expectTextContains(text);
    }

    async clickNext() {
        await this.nextBtn.click();
    }

    async clickFinish() {
        await this.finishButton.click();
    }

    async clickContinueAnyway() {
        await this.continueAnywayButton.click();
    }

    async clickOnNewPhoneButton() {
        await this.newPhonesButton.click();
    }

    async verifyEnteredPhoneDetails(phoneType: string, phoneNumber: string, phoneExtension?: string) {
        await this.section('Verify Entered Phone Details', async () => {
            await this.enteredphoneType.verifyTextEquals(phoneType);
            await this.enteredphoneNumber.verifyTextEquals(phoneNumber);
            await this.enteredphoneExtension.verifyTextEquals(phoneExtension || '');
        });
    }

    async fillAddressDetails(type: string, street: string, city: string, zip: string, country: string, state: string, county?: string): Promise<Array<{
        type: string;
        street: string;
        city: string;
        zip: string;
        country: string;
        state: string;
    }>> {
        await this.section('Fill Address Details', async () => { });
        //await this.newAddressButton.click();
        const addressDetailsList: Array<{
            type: string;
            street: string;
            city: string;
            zip: string;
            country: string;
            state: string;
        }> = [];
        if (!await this.enteredAddressType.isPresent()) {
            await this.newAddressButton.click();
            await this.addresstypeDropdown.select(type);
            await this.streetInput.fill(street);
            await this.cityInput.fill(city);
            await this.zipInput.fill(zip);
            await this.countryDropdown.select(country);
            await this.stateDropdown.select(state);
            await this.countyInput.fill(county || '');
            await this.okButton.click();
            const addressDetail = {
                type: type || '',
                street: street || '',
                city: city || '',
                zip: zip || '',
                country: country || '',
                state: state || '',
            };
            addressDetailsList.push(addressDetail);
        } else {
            const type = await this.enteredAddressType.getText();
            const street = await this.enteredAddressStreet.getText();
            const city = await this.enteredAddressCity.getText();
            const zip = await this.enteredAddressZip.getText();
            const country = await this.enteredAddressCountry.getText();
            const state = await this.enteredAddressState.getText();
            const addressDetail = {
                type: type || '',
                street: street || '',
                city: city || '',
                zip: zip || '',
                country: country || '',
                state: state || '',
            };
            addressDetailsList.push(addressDetail);
        }
        return addressDetailsList;
    }

    async addExperienceDetails(currency: string, salary: string) {
        await this.section('Add Professional Experience Details', async () => {
            await this.currencyDropdown.scrollIfNeeded();
            await this.currencyDropdown.select(currency);
            await this.salaryInput.fill(salary);
        });
    }

    async verifyCandidateProfileCreation(candidateEmail: string) {
        await this.section('Verify Candidate Profile Creation', async () => {
            await this.profilecreatedpageDiv.expectVisible();
            await this.emailCheckLink.verifyTextEquals(candidateEmail);
        });
    }

    /**
     * Fetches all address details from entered address fields.
     * Returns an array of address objects containing all address information.
     * 
     * @returns Promise<Array<AddressDetails>> - Array of address details objects
     * @example
     * const addresses = await candidatePage.getAllAddressDetails();
     * console.log(addresses); 
     * // [{ type: 'Home', street: '123 Main St', city: 'NYC', ... }]
     */
    async getAllAddressDetails(): Promise<Array<{
        type: string;
        street: string;
        city: string;
        zip: string;
        country: string;
        state: string;
    }>> {
        await this.section('Fetch All Address Details', async () => { });

        const addressDetailsList: Array<{
            type: string;
            street: string;
            city: string;
            zip: string;
            country: string;
            state: string;
        }> = [];
        // Fetch all address field values using the Input component's inputValue method
        const type = await this.enteredAddressType.getText();
        const street = await this.enteredAddressStreet.getText();
        const city = await this.enteredAddressCity.getText();
        const zip = await this.enteredAddressZip.getText();
        const country = await this.enteredAddressCountry.getText();
        const state = await this.enteredAddressState.getText();
        //const county = await this.enteredAddressCounty.textContent();

        // Create address object
        const addressDetail = {
            type: type || '',
            street: street || '',
            city: city || '',
            zip: zip || '',
            country: country || '',
            state: state || '',

        };

        addressDetailsList.push(addressDetail);

        this.logger?.info(
            `Successfully fetched address details`,
        );

        return addressDetailsList;
    }



}

