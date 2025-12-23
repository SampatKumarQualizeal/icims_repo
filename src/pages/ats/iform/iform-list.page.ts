// src/pages/ats/iform-list.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * IFormListPage
 * Create/Manage iForms page for creating and listing iForms
 */
export class IFormListPage extends BasePage {
  
  
  // Navigation components (on main page, not in iframe)
  private readonly navigatorMenuBtn: Button;
  private readonly adminLink: Button;
  private readonly iFormsLink: Button;
  private readonly createManageIFormsLink: Link;
  private readonly createiFormBtn: Button;
  private readonly searchBtn: Button;
  private readonly personBtn: Button;
  private readonly personLink: Link;
  constructor(page: Page) {
    // STEP 1: Resolve main iframe
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'iForm List Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
     
    this.createiFormBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Create iForm' }),
      'Create iForm Button'
    );
    
    // Navigation components (on main page)
    this.navigatorMenuBtn = new Button(
      page,
      page.getByRole('button', { name: 'Navigator Menu' }),
      'Navigator Menu Button'
    );
    
    this.adminLink = new Button(
      page,
      page.getByRole('button', { name: 'Admin' }),
      'Admin Button'
    );
    
    this.iFormsLink = new Button(
      page,
      page.getByRole('button', { name: 'iForms' }),
      'iForms Button'
    );
        
    this.createManageIFormsLink = new Link(
      page,
      page.getByRole('link', { name: 'Create/Manage iForms' }),
      'Create/Manage iForms Link'
    );
    
    this.searchBtn = new Button(
      page,
      page.getByRole('button', { name: 'Search' }),
      'Search Button'
    );
    this.personBtn = new Button(
      page,
      page.getByRole('button', { name: 'Person' }),
      'Person Button'
    );
    this.personLink = new Link(
      page,
      page.getByRole('link', { name: 'Person' }),
      'Create/Manage iForms Link'
    );

  }

  async navigateTo() {
    await this.section('Navigate to Create/Manage iForms', async () => {
      await this.navigatorMenuBtn.click();
      await this.adminLink.click();
      await this.iFormsLink.click();
      await this.createManageIFormsLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

   async navigateToPearsonSearch() {
    await this.section('Navigate to Create/Manage iForms', async () => {
      await this.navigatorMenuBtn.click();
      await this.searchBtn.click();
      await this.personBtn.click();
      await this.personLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expectLoaded() {
    await this.section('iForm List - verify loaded', async () => {
      await this.createiFormBtn.expectVisible();
    });
  }
  
  async clickCreateIForm(): Promise<Page> {
  const [popup] = await Promise.all([
    this.page.waitForEvent('popup'),
    this.createiFormBtn.click(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  return popup;
}

}
