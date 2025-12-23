import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';

/**
 * BaseFragment
 */
export class BaseFragment extends BasePage {
  constructor(page: Page, locator: Locator, friendlyName: string) {
    super(page, locator, friendlyName);
  }
}
