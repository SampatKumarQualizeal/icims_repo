// src/flows/ats/candidate/subflows/add-address.flow.ts
import { Page } from '@playwright/test';
// import { AddressesTabPage } from '@src/pages/ats/candidate/addresses-tab.page';
// import { AddressModalPage } from '@src/pages/ats/candidate/address-modal.page';

export async function addAddress(page: Page, addr: {
  type: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  state: string;
  county?: string;
}) {
  // const addressesTab = new AddressesTabPage(page);
  // const modal = new AddressModalPage(page);

  // await addressesTab.openNewAddressModal();
  // await modal.expectLoaded();
  // await modal.fillAddress(addr);
  // await modal.ok();
}
