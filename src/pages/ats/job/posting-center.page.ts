import { Page, Locator } from '@playwright/test';
import { Button } from '@src/components/button.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Div } from '@src/components/div.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Input } from '@src/components/input.component';
import { Label } from '@src/components/label.component';
import { BasePage } from '@src/pages/base.page';

/**
 * PostingCenterPage
 * Handles job posting actions inside:
 *   [data-testid="main-body-iframe"] → iframe[name="target_frame_left"]
 *
 * All UI elements for posting operations (portal selection, posting,
 * unposting, status verification, external link) exist in the left pane iframe.
 */
export class PostingCenterPage extends BasePage {

  // Tabs (main-body-iframe root, but kept here for simplicity)
  readonly mainFrame:any;
  readonly leftFrame:any;
  readonly sourceTab: Button;

  // Posting Center controls (inside target_frame_left)
  readonly postToCareerPortalsBtn: Button;
  readonly careerPortalDropdown: Dropdown;
  readonly endDateInput: Input;
  readonly chooseDateBtn: Button;
  readonly okDateBtn: Button;
  readonly postBtn: Button;
  readonly cancelPostBtn: Button;
  readonly unpostBtn: Button;
  readonly externalBtn: Button;
  readonly progressBar: Div;
  
  constructor(page: Page) {
    // STEP 1: Resolve frame structure
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const leftFrame = mainFrame.frameLocator('iframe[name="target_frame_left"]');

    // STEP 2: Use iframe body as root (no page-level root exists)
    super(page, leftFrame.locator('body'), 'Posting Center');

    this.mainFrame = mainFrame;
    this.leftFrame = leftFrame;

    // STEP 3: Resolve locators
    const sourceTabLoc: Locator = mainFrame.getByRole('tab', { name: 'Source' });
    const postToCareerLoc: Locator = leftFrame.getByRole('button', {name: /Post to Career Portals/});
    const progressBarLoc: Locator = leftFrame.getByRole('progressbar', {name: /Loading/});
    const portalDropdownLoc: Locator = leftFrame.locator("body");
    const endDateLoc: Locator = leftFrame.getByRole('textbox', { name: 'End' });
    const chooseDateBtnLoc: Locator = leftFrame.getByRole('button', {name: 'Choose date',exact: true});
    const okDateBtnLoc: Locator = leftFrame.getByRole('button', { name: 'OK' });
    const postBtnLoc: Locator = leftFrame.getByRole('button', {name: 'Post',exact: true});
    const cancelPostBtnLoc: Locator = leftFrame.getByRole('button', {name: 'Cancel post'});
    const unpostBtnLoc: Locator = leftFrame.getByRole('button', {name: 'Unpost'});
    const externalBtnLoc: Locator = leftFrame.locator("//button[.='External']");//getByRole('button', {name: 'External'}).nth(1);

    // STEP 4: Instantiate components
    this.sourceTab = new Button(page, sourceTabLoc, 'Source Tab');
    this.postToCareerPortalsBtn = new Button(page, postToCareerLoc, 'Post to Career Portals');
    this.progressBar = new Div(page, progressBarLoc, 'Progress Bar');
    this.careerPortalDropdown = new Dropdown(page, portalDropdownLoc, 'Career Portal Dropdown');
    this.endDateInput = new Input(page, endDateLoc, 'End Date');
    this.chooseDateBtn = new Button(page, chooseDateBtnLoc, 'Choose Date');
    this.okDateBtn = new Button(page, okDateBtnLoc, 'OK Date');
    this.postBtn = new Button(page, postBtnLoc, 'Post Button');
    this.cancelPostBtn = new Button(page, cancelPostBtnLoc, 'Cancel Post');
    this.unpostBtn = new Button(page, unpostBtnLoc, 'Unpost Button');
    this.externalBtn = new Button(page, externalBtnLoc, 'External Job Link');
  }

  /** Verify Posting Center loaded */
  async expectLoaded() {
    await this.section('Posting Center - verify loaded', async () => {
      await this.sourceTab.expectVisible();
    });
  }

  /** Click Source tab and open Post To Career Portals */
  async openPostToCareerPortals() {
    await this.section('Open Post to Career Portals', async () => {
      await this.sourceTab.click();
      await this.page.waitForLoadState('networkidle');
      await this.progressBar.waitForDisappear();
      // Wait for Post to Career Portals button to be visible after tab loads
      await this.postToCareerPortalsBtn.expectVisible();
      await this.postToCareerPortalsBtn.click();
      // Wait for posting center form to load
      await this.careerPortalDropdown.expectVisible();
    });
  }

  /** Select portal type (e.g., External) */
  async selectPortal(label:string, portalName: string) {
    await this.section(`Select Portal: ${label} > ${portalName}`, async () => {
      await this.careerPortalDropdown.customSelect(label, portalName);
    });
  }

  /** Select end date using date picker */
  async setEndDate(day: string) {
    await this.section(`Set posting end date: ${day}`, async () => {
      await this.endDateInput.click();
      await this.chooseDateBtn.click();

      const dateCellLoc = this.root.getByRole('gridcell', { name: day, exact: true });
      const dateCell = new Button(this.page, dateCellLoc, `Date ${day}`);
      await dateCell.click();

      await this.okDateBtn.click();
    });
  }

  /** Select first posting checkbox */
  async selectFirstPosting(label: string) {
    await this.section(`Select posting checkbox: ${label}`, async () => {
      const checkboxLoc = this.leftFrame.locator(`//tr//button[.='${label}']/parent::td/preceding-sibling::td//input[@type='checkbox']`);
      const checkbox = new Checkbox(this.page, checkboxLoc, 'Posting Checkbox');
      await checkbox.check();
    });
  }

  /** Click Cancel → Unpost */
  async cancelPost() {
    await this.section('Cancel posting', async () => {
      await this.cancelPostBtn.click();
      await this.unpostBtn.click();
    });
  }

  /** Click Post */
  async post() {
    await this.section('Post job', async () => {
      await this.postBtn.click();
    });
  }

  /** Verify a portal appears in table */
  async portalVisible(portal: string) {
    await this.section(`Verify portal visible: ${portal}`, async () => {
      const cellLoc = this.root.getByRole('cell', { name: portal });
      const cell = new Label(this.page, cellLoc, `${portal} Cell`);
      await cell.expectVisible();
    });
  }

  /** Verify posting status text (Posted / Unposted) */
  async statusVisible(status: string) {
    await this.section(`Verify status: ${status}`, async () => {
      const statusLoc = this.root.getByText(status, { exact: true });
      const statusLabel = new Label(this.page, statusLoc, `Status ${status}`);
      await statusLabel.expectVisible();
    });
  }

  /** Click External link (new tab will open) */
  async openPortalLink(name:string) {
    const button = new Button(this.page, this.leftFrame.locator(`//button[.='${name}']`), `${name} Portal Link`);
    await button.click();
  }
}
