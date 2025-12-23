// src/utils/base-flow.util.ts
import { Page } from '@playwright/test';
import { BaseTest } from './base-test.util';

/**
 * BaseFlow
 * Base class for all flow orchestration classes.
 * Eliminates repetitive constructor boilerplate by handling BaseTest and Page storage.
 * 
 * All flows should extend this class to avoid duplicating:
 * - private base: BaseTest;
 * - private page: Page;
 * - this.base = baseTest;
 * - this.page = page;
 * 
 * Usage:
 * ```typescript
 * export class MyFlow extends BaseFlow {
 *   readonly myPage: MyPage;
 * 
 *   constructor(baseTest: BaseTest, page: Page) {
 *     super(baseTest, page);
 *     this.myPage = new MyPage(page);
 *   }
 * }
 * ```
 */
export abstract class BaseFlow {
  protected readonly base: BaseTest;
  protected readonly page: Page;

  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
  }
}
