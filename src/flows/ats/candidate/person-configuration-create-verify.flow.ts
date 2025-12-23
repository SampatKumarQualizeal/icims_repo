import { _baseTest, Page } from "@playwright/test";
import { PersonConfiguration } from "@src/pages/ats/candidate/person-configuration.page";
import { CreateMenuPage } from "@src/pages/common/navigation/create-menu.page";
import { NavigatorMenuPage } from "@src/pages/common/navigation/nav-menu.page";





export async function personConfigurationFlow(page:Page , fieldGroupLabel:string): Promise<boolean> {

    // Navigation POMs
      const navigatorMenu = new NavigatorMenuPage(page);
      const createMenu = new CreateMenuPage(page);
      const personConfig = new PersonConfiguration(page);
      
      // Open System Configuration Wizard
      await navigatorMenu.openNavigator();
      await navigatorMenu.openAdmin();
      await createMenu.clickSystemConfiguration();
      await personConfig.navigateToSystemPersonContact();
      await personConfig.addNewFiledGroup(fieldGroupLabel);
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Address");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Currency");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Date");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Date & Time");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Decimal");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Image");
      //await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Dropdown (Single-Select)");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"Number");
      await personConfig.addFieldsToFieldGroup(fieldGroupLabel,"File");
      return await personConfig.navigateToPersonAndVerify("Test",fieldGroupLabel,'edit');
}


export async function navigateBackToFieldGroupToUpdateAccessAndVerifyPerson(page:Page , fieldGroupLabel:string , accessUpdate:string)
{
    // Navigation POMs
      const navigatorMenu = new NavigatorMenuPage(page);
      const createMenu = new CreateMenuPage(page);
      const personConfig = new PersonConfiguration(page);
      
      // Open System Configuration Wizard
      await navigatorMenu.openNavigator();
      await navigatorMenu.openAdmin();
      await createMenu.clickSystemConfiguration();
      await personConfig.navigateToSystemPersonContact();
      await personConfig.scrollToTheCreatedFieldGroupToUpdateAccess(fieldGroupLabel , accessUpdate); 
      await personConfig.navigateToPersonAndVerify("Test",fieldGroupLabel,accessUpdate);
}


 