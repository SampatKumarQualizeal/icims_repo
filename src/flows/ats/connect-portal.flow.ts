// src/flows/ats/connect-portal.flow.ts
import { Page } from '@playwright/test';
import { ConnectWelcomePage } from '@src/pages/connect/connect-welcome.page';
import { ConnectInterestsPage } from '@src/pages/connect/connect-interests.page';
import { ConnectResumePage } from '@src/pages/connect/connect-resume.page';
import { ConnectProfilePage } from '@src/pages/connect/connect-profile.page';
import { ConnectThankYouPage } from '@src/pages/connect/connect-thank-you.page';
import { ConnectDashboardPage } from '@src/pages/connect/connect-dashboard.page';
import { ConnectEmailSubscriptionsPage } from '@src/pages/connect/connect-email-subscriptions.page';

/**
 * ConnectPortalFlow
 * Orchestrates Connect Portal signup and navigation workflows
 */
export class ConnectPortalFlow {
  private page: Page;
  private welcomePage: ConnectWelcomePage;
  private interestsPage: ConnectInterestsPage;
  private resumePage: ConnectResumePage;
  private profilePage: ConnectProfilePage;
  private thankYouPage: ConnectThankYouPage;
  private dashboardPage: ConnectDashboardPage;
  private emailSubscriptionsPage: ConnectEmailSubscriptionsPage;

  constructor(page: Page) {
    this.page = page;
    this.welcomePage = new ConnectWelcomePage(page);
    this.interestsPage = new ConnectInterestsPage(page);
    this.resumePage = new ConnectResumePage(page);
    this.profilePage = new ConnectProfilePage(page);
    this.thankYouPage = new ConnectThankYouPage(page);
    this.dashboardPage = new ConnectDashboardPage(page);
    this.emailSubscriptionsPage = new ConnectEmailSubscriptionsPage(page);
  }

  /**
   * Set mobile viewport for responsive testing
   */
  async setMobileViewport(width: number = 375, height: number = 667) {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Navigate to Connect Portal welcome page
   */
  async navigateToWelcomePage(url: string) {
    await this.welcomePage.navigateTo(url);
    await this.welcomePage.expectLoaded();
  }

  /**
   * Complete signup workflow from welcome to thank you page
   */
  async completeSignup(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    zip: string;
    jobTitle?: string;
    talentPools: string[];
  }) {
    // Step 1: Welcome page - sign up with email
    await this.welcomePage.verifyProgressStepper();
    await this.welcomePage.verifySocialLoginOptions();
    await this.welcomePage.signUpWithEmail(data.email);

    // Step 2: Interests page - select talent pools
    await this.interestsPage.expectLoaded();
    for (const pool of data.talentPools) {
      await this.interestsPage.verifyTalentPoolOption(pool);
      await this.interestsPage.selectTalentPool(pool);
      await this.interestsPage.verifyTalentPoolChecked(pool);
    }
    await this.interestsPage.clickContinue();

    // Step 3: Resume page - skip upload
    await this.resumePage.expectLoaded();
    await this.resumePage.verifyCloudStorageOptions();
    await this.resumePage.clickSkip();

    // Step 4: Profile page - fill information
    await this.profilePage.expectLoaded();
    await this.profilePage.verifyEmailPrefilled(data.email);
    await this.profilePage.fillProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      zip: data.zip,
      jobTitle: data.jobTitle,
    });
    await this.profilePage.clickSubmit();

    // Step 5: Thank you page - verify confirmation
    await this.thankYouPage.expectLoaded();
    await this.thankYouPage.verifyConfirmationMessage();
    await this.thankYouPage.verifyUserName(data.firstName);
  }

  /**
   * Navigate to dashboard from thank you page
   */
  async navigateToDashboard() {
    await this.thankYouPage.clickDashboard();
    await this.dashboardPage.expectLoaded();
  }

  /**
   * Verify dashboard and navigate to email subscriptions
   */
  async navigateToEmailSubscriptions(userName: string) {
    await this.dashboardPage.verifyWelcomeMessage(userName);
    await this.dashboardPage.openGeneralOptions();
    await this.dashboardPage.verifyGeneralOptionsMenu();
    await this.dashboardPage.navigateToEmailSubscriptions();
    await this.emailSubscriptionsPage.expectLoaded();
  }

  /**
   * Verify talent pool subscriptions on email subscriptions page
   */
  async verifyEmailSubscriptions(talentPools: string[]) {
    for (const pool of talentPools) {
      await this.emailSubscriptionsPage.verifyTalentPoolSubscription(pool);
      await this.emailSubscriptionsPage.verifyTalentPoolChecked(pool);
    }
  }

  /**
   * Complete full mobile responsive workflow
   */
  async completeMobileResponsiveTest(
    url: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      zip: string;
      jobTitle?: string;
      talentPools: string[];
    }
  ) {
    // Set mobile viewport
    await this.setMobileViewport();

    // Navigate and complete signup
    await this.navigateToWelcomePage(url);
    await this.completeSignup(data);

    // Navigate to dashboard
    await this.navigateToDashboard();

    // Navigate to email subscriptions and verify
    await this.navigateToEmailSubscriptions(data.firstName);
    await this.verifyEmailSubscriptions(data.talentPools);
  }
}
