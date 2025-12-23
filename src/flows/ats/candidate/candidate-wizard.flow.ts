// src/flows/ats/candidate/candidate-wizard.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { NavigatorMenuPage } from '@src/pages/common/navigation/nav-menu.page';
import { CreateMenuPage } from '@src/pages/common/navigation/create-menu.page';
import { PersonMenuPage } from '@src/pages/common/navigation/person-menu.page';

import { CandidateCreatePage } from '@src/pages/ats/candidate/candidate-create.page';
import { generateUniqueName } from '@src/utils/name.util';

export class CandidateWizardFlow extends BaseFlow {
  private readonly candidateCreatePage: CandidateCreatePage;
  private readonly navigatorMenu: NavigatorMenuPage;
  private readonly createMenu: CreateMenuPage;
  private readonly personMenu: PersonMenuPage;
  


  constructor(base: BaseTest, page: Page) {
    super(base, page);
    this.candidateCreatePage = new CandidateCreatePage(page);
    this.navigatorMenu = new NavigatorMenuPage(this.page);
    this.createMenu = new CreateMenuPage(this.page);
    this.personMenu = new PersonMenuPage(this.page);
    this.candidateCreatePage = new CandidateCreatePage(this.page);

  }

  async completeCandidateWizard(data: any) {
    
    await this.navigatorMenu.navMenuButton.click();
    await this.navigatorMenu.createMenuButton.click();
    await this.createMenu.personBtn.click();
    await this.personMenu.candidateBtn.click();

    // Candidate Creation

    await this.candidateCreatePage.expectLoaded();
    // Fill out Candidate details
    await this.candidateCreatePage.uploadResume(data.resumePath);
    await this.candidateCreatePage.nextBtn.click();
    await this.candidateCreatePage.fillFirstName(data.firstName);
    data.email = `${generateUniqueName("Auto")}@cand.icims.com`;
    await this.candidateCreatePage.fillEmail(data.email);
    await this.candidateCreatePage.nextBtn.click();
  }

  async verifyPhoneDetails(data: { type: string; number: string; extension?: string }) {
    await this.candidateCreatePage.verifyEnteredPhoneDetails(data.type, data.number, data.extension);
  }

  async addDetailsFromAddressPage(data: any): Promise<any[]> {
    const Array = await this.candidateCreatePage.fillAddressDetails(data.address.type, data.address.street, data.address.city, data.address.zip, data.address.country, data.address.state, data.address.county);
    await this.candidateCreatePage.addExperienceDetails(data.candidateDefaults.currency, data.candidateDefaults.salary);
    await this.candidateCreatePage.nextBtn.click();
    return Array;
  }

  async navigateToFinishAndVerifyCandidateProfile(data: any) {
    await this.candidateCreatePage.nextBtn.click();
    await this.candidateCreatePage.nextBtn.click();
    await this.candidateCreatePage.nextBtn.click();
    await this.candidateCreatePage.finishButton.click();
  }
}
