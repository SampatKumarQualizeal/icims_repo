import { test } from '@tests/governance';
import { crmLogin } from '@src/flows/crm/common/crm.login.flow';
import { config } from '@config/config';
import { AutomationFlow } from '@src/flows/crm/automation/automation.flow';

test('CRM-T226 - Create & manage automation campaign', async ({ baseTest }) => {
  const { page, logger } = baseTest;

  await crmLogin(page, {
    user: config.secrets.crm.username,
    password: config.secrets.crm.password
  });

  const automation = new AutomationFlow(page);
  const automationName = `Automation-Auto${Date.now().toString().slice(-4)}`;
  
  await automation.navToAutomations();
  await automation.createAutomation(automationName, "=+? (0)");
  await automation.addAction('Send email', 0);
  await automation.modifyPipelines();
  await automation.archiveAutomation();

});
