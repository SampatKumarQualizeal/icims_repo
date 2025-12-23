import { Page } from "@playwright/test";
import { Button } from "@src/components/button.component";
import { Dropdown } from "@src/components/dropdown.component";
import { Input } from "@src/components/input.component";
import { BasePage } from "@src/pages/base.page";
import { BaseTest } from "@src/utils/base-test.util";

export class PhoneDetailsPage extends BasePage {

    readonly phoneTypeDropdown: Dropdown;
    readonly phoneNumberInput: Input;
    readonly phoneExtensionInput: Input;
    readonly okButton: Button;

    constructor(page: Page) {
        super(page, page.locator('body'), 'Phone Details Popup');
        this.phoneTypeDropdown = new Dropdown(this.page, this.page.locator('select[name="PersonProfileFields.PhoneType"]'), 'Phone Type Dropdown');
        this.phoneNumberInput = new Input(this.page, this.page.locator("//input[@name='PersonProfileFields.PhoneNumber']"), 'Phone Number Input');
        this.phoneExtensionInput = new Input(this.page, this.page.locator("//input[@name='PersonProfileFields.PhoneExtension']"), 'Phone Extension Input');
        this.okButton = new Button(this.page, this.page.locator("//button/span[.='OK']/parent::button"), 'OK Button');
    }

    async enterPhoneDetails(phoneType: string, phoneNumber: string, phoneExtension?: string) {
        await this.section('Provide Phone Details', async () => {
            await this.phoneTypeDropdown.select(phoneType);
            await this.phoneNumberInput.fill(phoneNumber);
            await this.phoneExtensionInput.fill(phoneExtension || '');
            await this.okButton.click();
        });
    }

}