// // src/flows/ats/candidate/subflows/add-phone.flow.ts
// import { Page } from '@playwright/test';
// import { PhonesTabPage } from '@src/pages/ats/candidate/phones-tab.page';
// import { PhoneModalPage } from '@src/pages/ats/candidate/phone-modal.page';

// export async function addPhone(page: Page, phone: {
//   type: string;
//   number: string;
//   extension?: string;
// }) {
//   const phonesTab = new PhonesTabPage(page);
//   const modal = new PhoneModalPage(page);

//   await phonesTab.openNewPhoneModal();
//   await modal.expectLoaded();
//   await modal.fillPhone(phone);
//   await modal.ok();
// }
