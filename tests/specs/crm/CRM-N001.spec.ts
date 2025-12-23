// tests/specs/crm/CRM-N001.spec.ts
import { test } from '@tests/governance';
import { CrmLoginPage } from '@src/pages/crm/login.page';
import { ContactCreatePage } from '@src/pages/crm/contact-create.page';
import { config } from '@config/config';
import contactScenario from '@tests/data/scenarios/crm/CRM-N001.json';

// Test: TC-N001 - Create a new contact

test.describe('CRM - Contact Creation', () => {
  test('should accept valid inputs and display appropriate message [TC-N001]', async ({ page }) => {
    // Login
    const loginPage = new CrmLoginPage(page);
    await loginPage.expectLoaded();
    await loginPage.section('Login to CRM', async () => {
      await loginPage.page.getByRole('textbox', { name: /email/i }).fill(contactScenario.loginData.email);
      await loginPage.page.getByRole('textbox', { name: /password/i }).fill(contactScenario.loginData.password);
      await loginPage.page.getByRole('button', { name: /login/i }).click();
    });

    // Navigate to Contact Create page
    await page.goto(`${config.crmBaseUrl}/contacts/new`);
    const contactCreatePage = new ContactCreatePage(page);
    await contactCreatePage.expectLoaded();

    // Fill and submit the contact creation form
    await contactCreatePage.createContact({
      firstName: contactScenario.contactData.firstName,
      lastName: contactScenario.contactData.lastName,
      phone: contactScenario.contactData.phoneNumber,
      company: contactScenario.contactData.company,
      email: contactScenario.contactData.email,
      // category: can be added if required by test data
    });
    // Success message assertion is handled in createContact()
  });
});
