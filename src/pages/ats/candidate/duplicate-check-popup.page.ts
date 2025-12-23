import { Page } from "@playwright/test";
import { Button } from "@src/components/button.component";
import { BasePage } from "@src/pages/base.page";

export class DuplicateCheckPopupPage extends BasePage {

    readonly continueAnywayButton: Button;

    constructor(page: Page) {
        super(page, 'Duplicate Check Popup');
        this.continueAnywayButton = new Button(this.page, this.page.locator("//button/span[.='Continue Anyway']/parent::button"), 'Continue Anyway Button');
    }

    async clickOnContinueAnywayButton() {
        await this.continueAnywayButton.click();
    }
}