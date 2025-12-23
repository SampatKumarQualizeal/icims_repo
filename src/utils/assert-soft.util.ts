
import { Logger } from '@src/utils/logger.util';
import { BaseComponent } from '@src/components/base.component';
import { assertThat } from './assert-generic.util';
import { test } from '@playwright/test';
import { TabManager } from '@src/components/tab-manager.component';
import { FailureCategorizer } from '@src/utils/failure.categorizer';
/**
 * Soft Assertions Engine with Playwright Step Annotation
 */
export function softAssertions() {
    const failures: string[] = [];

    // Use the global test logger
    const logger: Logger = (globalThis as any).__TEST_LOGGER__;

    async function recordError(err: any, message: string) {
        const finalMsg = `[Soft Assert Failed] ${message}`;
        failures.push(finalMsg);
        logger?.warn(finalMsg);

        // Wrap as Playwright step (red, failed)
        // await test.step(finalMsg, async () => {
        //     // No throw here —— soft assertion!
        // });
    }

    /**
     * Wraps any assertion logic with a step annotation.
     * If assertion fails, do NOT stop execution.
     */
    async function capture(
        description: string,
        fn: () => void | Promise<void>
    ) {
        try {
            await test.step(`[Soft Assert] ${description}`, async () => {
                const maybePromise = fn();
                if (maybePromise instanceof Promise) await maybePromise;
            });
        } catch (err: any) {
            await recordError(err, description);
        }
    }

    return {

        // --------------------------------------------------------------------
        // GENERIC VALUE ASSERTIONS
        // --------------------------------------------------------------------
        assertThat(actual: any) {
            return {
                equals: (expected: any, msg?: string) =>
                    capture(msg ?? `Expected ${actual} == ${expected}`, () =>
                        assertThat(actual).equals(expected, msg)
                    ),

                notEquals: (expected: any, msg?: string) =>
                    capture(msg ?? `Expected ${actual} != ${expected}`, () =>
                        assertThat(actual).notEquals(expected, msg)
                    ),

                truthy: (msg?: string) =>
                    capture(msg ?? `Expected value to be truthy`, () =>
                        assertThat(actual).truthy(msg)
                    ),

                falsy: (msg?: string) =>
                    capture(msg ?? `Expected value to be falsy`, () =>
                        assertThat(actual).falsy(msg)
                    ),

                contains: (text: string, msg?: string) =>
                    capture(msg ?? `Expected "${actual}" to contain "${text}"`, () =>
                        assertThat(actual).contains(text, msg)
                    ),

                startsWith: (prefix: string, msg?: string) =>
                    capture(msg ?? `Expected "${actual}" to start with "${prefix}"`, () =>
                        assertThat(actual).startsWith(prefix, msg)
                    ),

                endsWith: (suffix: string, msg?: string) =>
                    capture(msg ?? `Expected "${actual}" to end with "${suffix}"`, () =>
                        assertThat(actual).endsWith(suffix, msg)
                    ),

                greaterThan: (n: number, msg?: string) =>
                    capture(msg ?? `Expected ${actual} > ${n}`, () =>
                        assertThat(actual).greaterThan(n, msg)
                    ),

                lessThan: (n: number, msg?: string) =>
                    capture(msg ?? `Expected ${actual} < ${n}`, () =>
                        assertThat(actual).lessThan(n, msg)
                    ),

                deepEquals: (expected: any, msg?: string) =>
                    capture(msg ?? `Deep equality check`, () =>
                        assertThat(actual).deepEquals(expected, msg)
                    ),
            };
        },

        // --------------------------------------------------------------------
        // COMPONENT (UI ELEMENT) ASSERTIONS
        // --------------------------------------------------------------------
        component(component: BaseComponent) {
            const name = component.friendlyName;

            return {
                visible: () =>
                    capture(`Assert Visible: ${name}`, () =>
                        component.verifyVisible({ annotate: false })
                    ),

                hidden: () =>
                    capture(`Assert Hidden: ${name}`, () =>
                        component.verifyHidden({ annotate: false })
                    ),

                exists: () =>
                    capture(`Assert Exists: ${name}`, () =>
                        component.verifyExists({ annotate: false })
                    ),

                notExists: () =>
                    capture(`Assert Not Exists: ${name}`, () =>
                        component.verifyNotExists({ annotate: false })
                    ),

                textEquals: (value: string) =>
                    capture(`Assert Text Equals "${value}": ${name}`, () =>
                        component.verifyTextEquals(value, { annotate: false })
                    ),

                textContains: (value: string) =>
                    capture(`Assert Text Contains "${value}": ${name}`, () =>
                        component.verifyTextContains(value, { annotate: false })
                    ),
            };
        },

        // --------------------------------------------------------------------
        // GROUPING
        // --------------------------------------------------------------------
        group(label: string, fn: (group: any) => void | Promise<void>) {
            return test.step(`[Soft Assert Group] ${label}`, async () => {
                await fn(this);
            });
        },

        // --------------------------------------------------------------------
        // FINAL REPORT (WITH RCA CATEGORIZATION)
        // --------------------------------------------------------------------
        async report(tabManager?: { cleanupTabs: (main?: string) => Promise<void>, listTabs: () => string[], evidenceDir?: string }) {
            if (failures.length === 0) {
                logger?.info('[Soft Assert] All checks passed');
                return;
            }

            // Build summary
            const summary =
                `\n===== SOFT ASSERT FAILURES (${failures.length}) =====\n` +
                failures.map((f, i) => `${i + 1}. ${f}`).join('\n') +
                `\n=============================================\n`;

            logger?.error(summary);

            // --- RCA Categorization (NEW) ---
            try {
                const primaryFailure = failures[0] ?? summary;

                await test.step("[Soft Assert RCA] Categorizing failure", async () => {
                    const evidenceDir = (tabManager as any)?.evidenceDir ?? undefined;

                    const rca = await FailureCategorizer.categorize(
                        primaryFailure,
                        undefined,
                        evidenceDir
                    );

                    logger?.info("[Soft Assert RCA] Result", rca);
                });

            } catch (err) {
                logger?.warn("[Soft Assert RCA] Categorization failed", { error: String(err) });
            }

            // --- AUTO CLEANUP OF TABS ON SOFT FAILURES ---
            if (tabManager) {
                await test.step("[Soft Assert Cleanup] Closing leftover tabs", async () => {
                    try {
                        const openTabs = tabManager.listTabs?.() ?? [];
                        logger?.warn("[Soft Assert Cleanup] Open tabs before cleanup", openTabs);

                        await tabManager.cleanupTabs("Main Tab");

                    } catch (err) {
                        logger?.error("[Soft Assert Cleanup] Failed during cleanup", {
                            error: String(err),
                        });
                    }
                });
            }

            // Finally throw soft assertion exception
            throw new Error(summary);
        },

        // --------------------------------------------------------------------
        // TAB MANAGER SOFT ASSERTIONS
        // --------------------------------------------------------------------
        tabs(tabManager: TabManager) {
            return {

                exists: (name: string) =>
                    capture(
                        `Tab Exists: ${name}`,
                        async () => {
                            const list = tabManager.listTabs();
                            if (!list.includes(name)) {
                                throw new Error(`Tab '${name}' does not exist. Found: ${list.join(', ')}`);
                            }
                        }
                    ),

                notExists: (name: string) =>
                    capture(
                        `Tab Not Exists: ${name}`,
                        async () => {
                            const list = tabManager.listTabs();
                            if (list.includes(name)) {
                                throw new Error(`Tab '${name}' should not exist but it does.`);
                            }
                        }
                    ),

                opened: (name: string) =>
                    capture(
                        `Tab Opened: ${name}`,
                        async () => {
                            const list = tabManager.listTabs();
                            if (!list.includes(name)) {
                                throw new Error(
                                    `Expected tab '${name}' to be opened, but it isn't. Found tabs: ${list.join(', ')}`
                                );
                            }
                        }
                    ),

                active: (name: string) =>
                    capture(
                        `Active Tab Equals: ${name}`,
                        async () => {
                            const active = (tabManager as any).activeTabName;
                            if (active !== name) {
                                throw new Error(
                                    `Expected active tab to be '${name}', but found '${active}'.`
                                );
                            }
                        }
                    ),

                count: (expected: number) =>
                    capture(
                        `Tab Count == ${expected}`,
                        async () => {
                            const list = tabManager.listTabs();
                            if (list.length !== expected) {
                                throw new Error(
                                    `Expected ${expected} tabs but found ${list.length} (${list.join(', ')})`
                                );
                            }
                        }
                    ),
            };
        },

    };
}
