import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from './base.component';
import { getExecutionProfile } from '@src/utils/execution-profile.util';

/**
 * Tree Component
 * Supports hierarchical tree structures with:
 *  - Expand/collapse nodes
 *  - Select/deselect nodes
 *  - Navigate by path (e.g., "Root > Child > Grandchild")
 *  - Verify node states (expanded, selected, visible)
 *  - Find nodes by text or role
 */
export class Tree extends BaseComponent {
  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  /**
   * Expand a tree node by text or locator
   */
  async expand(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Expand node (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        // Check if already expanded
        const isExpanded = await nodeLocator.getAttribute('aria-expanded');
        if (isExpanded === 'true') {
          this.logger.info(`Node already expanded: ${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'node'}`);
          return;
        }

        // Find and click expand button/icon
        const expandButton = nodeLocator.locator('[aria-label*="expand"], [data-testid*="expand"], button').first();
        if (await expandButton.count() > 0) {
          await expandButton.click();
        } else {
          // Fallback: click the node itself
          await nodeLocator.click();
        }

        // Wait for expansion
        const profile = getExecutionProfile();
        await expect(nodeLocator).toHaveAttribute('aria-expanded', 'true', { timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Collapse a tree node by text or locator
   */
  async collapse(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Collapse node (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        // Check if already collapsed
        const isExpanded = await nodeLocator.getAttribute('aria-expanded');
        if (isExpanded === 'false' || isExpanded === null) {
          this.logger.info(`Node already collapsed: ${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'node'}`);
          return;
        }

        // Find and click collapse button/icon
        const collapseButton = nodeLocator.locator('[aria-label*="collapse"], [data-testid*="collapse"], button').first();
        if (await collapseButton.count() > 0) {
          await collapseButton.click();
        } else {
          // Fallback: click the node itself
          await nodeLocator.click();
        }

        // Wait for collapse
        const profile = getExecutionProfile();
        await expect(nodeLocator).toHaveAttribute('aria-expanded', 'false', { timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Select a tree node (single selection)
   */
  async select(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Select node (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await nodeLocator.click();

        // Verify selection
        const profile = getExecutionProfile();
        await expect(nodeLocator).toHaveAttribute('aria-selected', 'true', { timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Deselect a tree node
   */
  async deselect(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Deselect node (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        // Check if already deselected
        const isSelected = await nodeLocator.getAttribute('aria-selected');
        if (isSelected === 'false' || isSelected === null) {
          this.logger.info(`Node already deselected: ${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'node'}`);
          return;
        }

        await nodeLocator.click();

        // Verify deselection
        const profile = getExecutionProfile();
        await expect(nodeLocator).toHaveAttribute('aria-selected', 'false', { timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Navigate through tree hierarchy by path (e.g., "Parent > Child > Grandchild")
   * Automatically expands nodes along the path
   */
  async navigateToPath(
    path: string,
    separator: string = '>',
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Navigate to path: ${path}`,
      async (root) => {
        const profile = getExecutionProfile();
        const nodes = path.split(separator).map(n => n.trim());
        
        for (let i = 0; i < nodes.length; i++) {
          const nodeName = nodes[i];
          const nodeLocator = root.getByRole('treeitem', { name: nodeName });

          // Wait for node to be visible
          await nodeLocator.waitFor({ state: 'visible', timeout: profile.timeouts.navigation });

          // If not the last node, expand it
          if (i < nodes.length - 1) {
            const isExpanded = await nodeLocator.getAttribute('aria-expanded');
            if (isExpanded !== 'true') {
              const expandButton = nodeLocator.locator('[aria-label*="expand"], [data-testid*="expand"], button').first();
              if (await expandButton.count() > 0) {
                await expandButton.click();
              } else {
                await nodeLocator.click();
              }
              await expect(nodeLocator).toHaveAttribute('aria-expanded', 'true', { timeout: profile.timeouts.component });
            }
          } else {
            // Last node - just click to select
            await nodeLocator.click();
          }
        }

        this.logger.info(`Successfully navigated to: ${path}`);
      },
      execOptions
    );
  }

  /**
   * Get a specific tree node by text
   */
  getNode(nodeName: string): Locator {
    return this.locator.getByRole('treeitem', { name: nodeName });
  }

  /**
   * Get all visible tree nodes
   */
  getAllNodes(): Locator {
    return this.locator.getByRole('treeitem');
  }

  /**
   * Verify node is expanded
   */
  async expectExpanded(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Expect node expanded (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const profile = getExecutionProfile();
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await expect(nodeLocator).toHaveAttribute('aria-expanded', 'true', { timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Verify node is collapsed
   */
  async expectCollapsed(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Expect node collapsed (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        const isExpanded = await nodeLocator.getAttribute('aria-expanded');
        expect(isExpanded === 'false' || isExpanded === null).toBeTruthy();
      },
      execOptions
    );
  }

  /**
   * Verify node is selected
   */
  async expectSelected(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Expect node selected (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const profile = getExecutionProfile();
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await expect(nodeLocator).toHaveAttribute('aria-selected', 'true', { timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Verify node is visible
   */
  async expectNodeVisible(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Expect node visible (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const profile = getExecutionProfile();
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await expect(nodeLocator).toBeVisible({ timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Verify node is hidden/not visible
   */
  async expectNodeHidden(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Expect node hidden (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const profile = getExecutionProfile();
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await expect(nodeLocator).toBeHidden({ timeout: profile.timeouts.component });
      },
      execOptions
    );
  }

  /**
   * Count total visible nodes
   */
  async countVisibleNodes(
    execOptions?: { retries?: number; annotate?: boolean }
  ): Promise<number> {
    return this.exec(
      'Count visible nodes',
      async (root) => {
        const nodes = root.getByRole('treeitem');
        return await nodes.count();
      },
      execOptions
    );
  }

  /**
   * Right-click on a tree node (for context menu)
   */
  async rightClick(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Right-click node (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await nodeLocator.click({ button: 'right' });
      },
      execOptions
    );
  }

  /**
   * Double-click on a tree node
   */
  async doubleClick(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      `Double-click node (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        await nodeLocator.dblclick();
      },
      execOptions
    );
  }

  /**
   * Expand all nodes in the tree (use with caution on large trees)
   */
  async expandAll(
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      'Expand all nodes',
      async (root) => {
        const expandButtons = root.locator('[aria-expanded="false"]');
        const count = await expandButtons.count();

        for (let i = 0; i < count; i++) {
          const button = expandButtons.nth(i);
          if (await button.isVisible()) {
            await button.click();
            await this.page.waitForTimeout(200); // Small delay between expansions
          }
        }

        this.logger.info(`Expanded ${count} nodes`);
      },
      execOptions
    );
  }

  /**
   * Collapse all nodes in the tree
   */
  async collapseAll(
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return this.exec(
      'Collapse all nodes',
      async (root) => {
        const collapseButtons = root.locator('[aria-expanded="true"]');
        const count = await collapseButtons.count();

        for (let i = 0; i < count; i++) {
          const button = collapseButtons.nth(i);
          if (await button.isVisible()) {
            await button.click();
            await this.page.waitForTimeout(200); // Small delay between collapses
          }
        }

        this.logger.info(`Collapsed ${count} nodes`);
      },
      execOptions
    );
  }

  /**
   * Find node by partial text match
   */
  async findNodeByPartialText(
    partialText: string,
    execOptions?: { retries?: number; annotate?: boolean }
  ): Promise<Locator | null> {
    return this.exec(
      `Find node by partial text: ${partialText}`,
      async (root) => {
        const allNodes = root.getByRole('treeitem');
        const count = await allNodes.count();

        for (let i = 0; i < count; i++) {
          const node = allNodes.nth(i);
          const text = await node.textContent();
          if (text && text.includes(partialText)) {
            this.logger.info(`Found node containing "${partialText}": ${text}`);
            return node;
          }
        }

        this.logger.warn(`No node found containing text: ${partialText}`);
        return null;
      },
      execOptions
    );
  }

  /**
   * Get node level/depth (aria-level attribute)
   */
  async getNodeLevel(
    nodeIdentifier: string | Locator,
    execOptions?: { retries?: number; annotate?: boolean }
  ): Promise<number> {
    return this.exec(
      `Get node level (${typeof nodeIdentifier === 'string' ? nodeIdentifier : 'locator'})`,
      async (root) => {
        const nodeLocator = typeof nodeIdentifier === 'string'
          ? root.getByRole('treeitem', { name: nodeIdentifier })
          : nodeIdentifier;

        const level = await nodeLocator.getAttribute('aria-level');
        return level ? parseInt(level, 10) : 1;
      },
      execOptions
    );
  }
}
