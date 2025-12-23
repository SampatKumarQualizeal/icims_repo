import { expect, test } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';

function getLogger(): Logger {
  return (globalThis as any).__TEST_LOGGER__;
}

type AssertOptions = {
  annotate?: boolean;
  label?: string;
};

// ---------------------------------------------------------------------------
// SAFE WRAPPER FOR test.step()
// NEVER FAILS when executed after test has finished
// ---------------------------------------------------------------------------
async function safeStep(
  annotate: boolean,
  label: string,
  fn: () => void | Promise<void>
) {
  const logger = getLogger();
  if (!annotate) return fn();

  const callStack = (new Error('assert stack')).stack?.split('\n').slice(1, 8).join('\n');
logger?.debug(`[ASSERT] ENTER ${label}`, { ts: Date.now(), stack: callStack });

  try {
    return await test.step(label, fn);
  } catch {
    // Happens when logger.section or cleanup runs after test completion
    return fn();
  }
}

// ---------------------------------------------------------------------------
// ASSERTION FACTORY
// ---------------------------------------------------------------------------
export function assertThat(actual: any, options?: AssertOptions) {
  const logger = getLogger();
  const annotate = options?.annotate ?? true;

  // Internal step wrapper
  function step(label: string, fn: () => void | Promise<void>) {
    const prefix = options?.label ? `ASSERT ${options.label}` : 'ASSERT';
    const fullLabel = `${prefix} ${label}`;

    return safeStep(annotate, fullLabel, async () => {
      logger?.info(`[ASSERT] ${fullLabel}`, { actual });
      await fn();
    });
  }

  return {
    // -----------------------------------------------------------------------
    // BASIC ASSERTIONS
    // -----------------------------------------------------------------------
    equals(expected: any, message?: string) {
      return step(`equals (${expected})`, () => {
        expect(actual).toEqual(expected);
      });
    },

    notEquals(expected: any, message?: string) {
      return step(`notEquals (${expected})`, () => {
        expect(actual).not.toEqual(expected);
      });
    },

    truthy(message?: string) {
      return step(`truthy`, () => {
        expect(actual).toBeTruthy();
      });
    },

    falsy(message?: string) {
      return step(`falsy`, () => {
        expect(actual).toBeFalsy();
      });
    },

    isTrue(message?: string) {
      return step(`isTrue`, () => {
        expect(actual).toBe(true);
      });
    },

    isFalse(message?: string) {
      return step(`isFalse`, () => {
        expect(actual).toBe(false);
      });
    },

    // -----------------------------------------------------------------------
    // STRING ASSERTIONS
    // -----------------------------------------------------------------------
    contains(text: string, message?: string) {
      return step(`contains (${text})`, () => {
        expect(String(actual)).toContain(text);
      });
    },

    startsWith(prefix: string, message?: string) {
      return step(`startsWith (${prefix})`, () => {
        expect(String(actual).startsWith(prefix)).toBe(true);
      });
    },

    endsWith(suffix: string, message?: string) {
      return step(`endsWith (${suffix})`, () => {
        expect(String(actual).endsWith(suffix)).toBe(true);
      });
    },

    matches(regex: RegExp, message?: string) {
      return step(`matches (${regex})`, () => {
        expect(String(actual)).toMatch(regex);
      });
    },

    // -----------------------------------------------------------------------
    // NUMBER ASSERTIONS
    // -----------------------------------------------------------------------
    greaterThan(n: number, message?: string) {
      return step(`greaterThan (${n})`, () => {
        expect(Number(actual)).toBeGreaterThan(n);
      });
    },

    lessThan(n: number, message?: string) {
      return step(`lessThan (${n})`, () => {
        expect(Number(actual)).toBeLessThan(n);
      });
    },

    // -----------------------------------------------------------------------
    // ARRAY ASSERTIONS
    // -----------------------------------------------------------------------
    arrayContains(item: any, message?: string) {
      return step(`arrayContains (${item})`, () => {
        expect(actual).toContain(item);
      });
    },

    arrayLength(length: number, message?: string) {
      return step(`arrayLength (${length})`, () => {
        expect(actual.length).toBe(length);
      });
    },

    // -----------------------------------------------------------------------
    // OBJECT ASSERTIONS
    // -----------------------------------------------------------------------
    hasKey(key: string, message?: string) {
      return step(`hasKey (${key})`, () => {
        expect(actual).toHaveProperty(key);
      });
    },

    deepEquals(expected: any, message?: string) {
      return step(`deepEquals`, () => {
        expect(actual).toStrictEqual(expected);
      });
    }
  };
}
