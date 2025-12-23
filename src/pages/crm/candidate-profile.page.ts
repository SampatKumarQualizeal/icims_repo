// src/pages/crm/candidate-profile.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';

/**
 * CandidateProfilePage
 * CRM candidate profile page with view/edit/delete actions
 */
export class CandidateProfilePage extends BasePage {
  readonly pageHeading: Div;
  readonly successMessage: Div;
  readonly actionsBtn: Button;
  readonly deleteCandidateBtn: Button;
  readonly deleteConfirmBtn: Button;
  readonly additionalInfoTab: Link;
  readonly pipelinesTab: Link;
  readonly documentsTab: Link;
  readonly backBtn: Button;
  readonly logoutLink: Link;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Candidate Profile Page');

    this.pageHeading = new Div(
      page,
      page.getByRole('heading', { level: 1 }).first(),
      'Candidate Name Heading'
    );

    this.successMessage = new Div(
      page,
      page.getByText('Candidate successfully created'),
      'Success Message'
    );

    this.actionsBtn = new Button(
      page,
      page.getByRole('button', { name: 'Actions' }),
      'Actions Button'
    );

    this.deleteCandidateBtn = new Button(
      page,
      page.getByRole('button', { name: 'Delete candidate' }),
      'Delete Candidate Button'
    );

    this.deleteConfirmBtn = new Button(
      page,
      page.getByRole('button', { name: 'Delete', exact: true }),
      'Delete Confirm Button'
    );

    this.additionalInfoTab = new Link(
      page,
      page.getByRole('tab', { name: 'Additional information' }),
      'Additional Information Tab'
    );

    this.pipelinesTab = new Link(
      page,
      page.getByRole('tab', { name: 'Pipelines' }),
      'Pipelines Tab'
    );

    this.documentsTab = new Link(
      page,
      page.getByRole('tab', { name: 'Documents' }),
      'Documents Tab'
    );

    this.backBtn = new Button(
      page,
      page.locator('button[aria-label="keyboard_backspace"]'),
      'Back Button'
    );

    this.logoutLink = new Link(
      page,
      page.getByRole('link', { name: 'Logout' }),
      'Logout Link'
    );
  }

  async expectLoaded() {
    await this.section('Expect CRM Candidate Profile page loaded', async () => {
      await this.pageHeading.expectVisible();
    });
  }

  async verifySuccessMessage() {
    await this.section('Verify success message', async () => {
      await this.successMessage.expectVisible();
    });
  }

  async verifyCandidateName(firstName: string, lastName: string) {
    await this.section(`Verify candidate name: ${firstName} ${lastName}`, async () => {
      const nameHeading = new Div(
        this.page,
        this.page.getByRole('heading', { name: `${firstName} ${lastName}`, level: 1 }),
        'Candidate Name Heading'
      );
      await nameHeading.expectVisible();
    });
  }

  async verifyEmail(email: string) {
    await this.section(`Verify email: ${email}`, async () => {
      const emailText = new Div(
        this.page,
        this.page.getByText(email).first(),
        'Email Text'
      );
      await emailText.expectVisible();
    });
  }

  async verifyPhone(phone: string) {
    await this.section(`Verify phone: ${phone}`, async () => {
      const phoneText = new Div(
        this.page,
        this.page.getByText(phone).first(),
        'Phone Text'
      );
      await phoneText.expectVisible();
    });
  }

  async clickAdditionalInfoTab() {
    await this.section('Click Additional Information tab', async () => {
      await this.additionalInfoTab.click();
      // Tab content load handled by component auto-wait
    });
  }

  async verifyReferralSource(referralSource: string) {
    await this.section(`Verify referral source: ${referralSource}`, async () => {
      const referralText = new Div(
        this.page,
        this.page.getByText(referralSource),
        'Referral Source Text'
      );
      await referralText.expectVisible();
    });
  }

  async clickPipelinesTab() {
    await this.section('Click Pipelines tab', async () => {
      await this.pipelinesTab.click();
      // Tab content load handled by component auto-wait
    });
  }

  async clickDocumentsTab() {
    await this.section('Click Documents tab', async () => {
      await this.documentsTab.click();
      // Tab content load handled by component auto-wait
    });
  }

  async clickBack() {
    await this.section('Click Back button', async () => {
      await this.backBtn.click();
      // Navigation handled by component auto-wait
    });
  }

  async deleteCandidate() {
    await this.section('Delete candidate', async () => {
      await this.actionsBtn.click();
      await this.deleteCandidateBtn.click();
      await this.deleteConfirmBtn.click();
      await this.page.waitForURL('**/search/**', { timeout: 10000 });
      // URL change wait sufficient, networkidle redundant
    });
  }

  async verifyDeletionSuccess() {
    await this.section('Verify deletion success', async () => {
      const deleteSuccessMsg = new Div(
        this.page,
        this.page.getByText('Candidate successfully deleted from database'),
        'Deletion Success Message'
      );
      await deleteSuccessMsg.expectVisible();
    });
  }

  async logout() {
    await this.section('Logout from CRM', async () => {
      await this.logoutLink.click();
      
      const logoutMessage = new Div(
        this.page,
        this.page.getByText('You have successfully logged out'),
        'Logout Success Message'
      );
      await logoutMessage.expectVisible();
    });
  }
}
