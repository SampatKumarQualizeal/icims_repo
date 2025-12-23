import { Page } from '@playwright/test';
import { Button } from './button.component';
import { Input } from './input.component';

export class HeaderComponent {
  readonly page: Page;

  readonly logo: Button;
  readonly notifications: Button;
  readonly quickSearchInput: Input;
  readonly quickSearchTypeButton: Button;
  readonly userMenu: Button;
  readonly menuToggle: Button;

  constructor(page: Page) {
    this.page = page;

    this.logo = new Button(page, '[data-testid="logo"]', 'Logo');
    this.notifications = new Button(page, '#notification-bell-icon', 'Notifications');
    this.quickSearchInput = new Input(page, '#quicksearch input', 'Quick Search Input');
    this.quickSearchTypeButton = new Button(page, '#quicksearch-menu-button', 'Quick Search Type Button');
    this.userMenu = new Button(page, '#navigatorUserMenu', 'User Menu');
    this.menuToggle = new Button(page, '#mobile-menu-toggle', 'Navigation Drawer Toggle');
  }

  async openMenu(execOptions?: { annotate?: boolean }) {
    await this.menuToggle.click(undefined, execOptions);
  }

  async search(text: string, execOptions?: { annotate?: boolean }) {
    await this.quickSearchInput.fill(text, execOptions);
    await this.page.keyboard.press('Enter');
  }
}
