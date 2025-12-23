import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from './base.component';
import { getExecutionProfile } from '@src/utils/execution-profile.util';
import { waitForElementStable } from '@src/utils/wait.util';

/**
 * Dropdown Component
 * Supports:
 *  - native <select>
 *  - role="combobox"
 *  - Angular Material <mat-select> + <mat-option>
 *  - simple text-based custom dropdowns
 */
export class Dropdown extends BaseComponent {
  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  /**
   * Auto-detects dropdown type and selects a value.
   */
  async select(
    value: string | number,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    const stringValue = String(value);

    return this.exec(
      `Select (${stringValue})`,
      async (root) => {
        const tag = await root.evaluate((el) => el.tagName.toLowerCase());

        // ----------------------------------------------------
        // CASE 1 → NATIVE <select>
        // ----------------------------------------------------
        if (tag === 'select') {
          await root.selectOption(stringValue);
          return;
        }

        // ----------------------------------------------------
        // CASE 2 → Angular Material <mat-select>
        // ----------------------------------------------------
        if (await root.locator('mat-select, .mat-select-trigger').count()) {
          await this.openMaterial(root);
          await this.pickMaterialOptionByText(stringValue);
          return;
        }

        // ----------------------------------------------------
        // CASE 3 → role="combobox"
        // ----------------------------------------------------
        const role = await root.getAttribute('role');
        if (role === 'combobox') {
          await this.openCombobox(root);
          await this.pickComboboxOption(stringValue);
          return;
        }

        // ----------------------------------------------------
        // CASE 4 → fallback (click + pick visible text)
        // ----------------------------------------------------
        await root.click();
        await this.page.getByText(stringValue, { exact: true }).click();
      },
      execOptions
    );
  }

  // ===========================================================================
  // ANGULAR MATERIAL SELECT
  // ===========================================================================
  private async openMaterial(root: Locator) {
    const profile = getExecutionProfile();
    
    // Click to open dropdown
    await root.click({ timeout: profile.timeouts.component });

    // Wait for options to appear and stabilize (handles animation)
    const firstOption = this.page.locator('[role="option"]').first();
    await firstOption.waitFor({ state: 'visible', timeout: profile.timeouts.modal });
    await waitForElementStable(firstOption, 200, profile.timeouts.component);
  }

  private async pickMaterialOptionByText(text: string) {
    const profile = getExecutionProfile();
    
    const option = this.page
      .locator('[role="option"]')
      .filter({ hasText: text })
      .first();

    await option.waitFor({ state: 'visible', timeout: profile.timeouts.component });
    await option.click({ timeout: profile.timeouts.component });

    // Wait until overlay closes
    await this.page.locator('.cdk-overlay-pane').waitFor({ 
      state: 'hidden', 
      timeout: profile.timeouts.modal 
    });
  }

  // ===========================================================================
  // SEMANTIC COMBOBOX (<role="combobox">)
  // ===========================================================================
  private async openCombobox(root: Locator) {
    const profile = getExecutionProfile();
    
    await root.click({ timeout: profile.timeouts.component });

    // Wait for options to appear and stabilize
    const firstOption = this.page.getByRole('option').first();
    await firstOption.waitFor({ state: 'visible', timeout: profile.timeouts.modal });
    await waitForElementStable(firstOption, 200, profile.timeouts.component);
  }

  private async pickComboboxOption(text: string) {
    const profile = getExecutionProfile();
    await this.page.getByRole('option', { name: text }).click({ 
      timeout: profile.timeouts.component 
    });
  }

  // ===========================================================================
  // BACKWARD COMPATIBILITY METHODS
  // ===========================================================================
  async pickByText(
    text: string,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Pick by Text (${text})`,
      async (loc) => {
        await loc.click();
        const profile = getExecutionProfile();
        await this.page.getByText(text).click({ 
          timeout: profile.timeouts.component 
        });
      },
      execOptions
    );
  }

  async pickByIndex(
    index: number,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Pick by Index (${index})`,
      async (loc) => {
        const tag = await loc.evaluate((el) => el.tagName.toLowerCase());

        // Native select
        if (tag === 'select') {
          const option = loc.locator('option').nth(index);
          const value = await option.getAttribute('value');

          if (!value) throw new Error(`No option found at index ${index}`);

          await loc.selectOption(value);
          return;
        }

        // Fallback for overlays
        await loc.click();
        const profile = getExecutionProfile();
        await this.page
          .locator('.cdk-overlay-pane [role="option"], .cdk-overlay-pane mat-option')
          .nth(index)
          .click({ timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  async pickByValue(
    value: string,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Pick by Value (${value})`,
      async (loc) => {
        const tag = await loc.evaluate((el) => el.tagName.toLowerCase());

        if (tag === 'select') {
          await loc.selectOption(value);
          return;
        }

        await loc.click();

        const profile = getExecutionProfile();
        await this.page
          .locator(
            `.cdk-overlay-pane [value="${value}"], .cdk-overlay-pane mat-option[value="${value}"]`
          )
          .click({ timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  async inputValue(execOptions?: { annotate?: boolean }) {
    let result = '';

    await this.exec(
      'Get Selected Value',
      async (loc) => {
        const tag = await loc.evaluate((el) => el.tagName.toLowerCase());

        if (tag === 'select') {
          result = await loc.inputValue();
          return;
        }

        // mat-select or custom
        const trigger = loc.locator('.mat-select-trigger, [role="combobox"]');
        result = await trigger.innerText();
      },
      execOptions
    );

    return result;
  }

  // ===========================================================================
  // Deprecated — kept for backward compatibility
  // ===========================================================================
  async customSelect(
    combobox: string,
    option: string | number,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Custom Select (${combobox})`,
      async (loc) => {
        await loc.getByRole('combobox', { name: combobox }).click();
        await loc.getByRole('option', { name: option.toString() }).click();
      },
      execOptions
    );
  }
}
