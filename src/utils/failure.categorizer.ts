
import fs from 'fs/promises';
import path from 'path';
import { TestInfo } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';

export type FailureCategory =
  | 'UI_ELEMENT_NOT_FOUND'
  | 'UI_TIMEOUT'
  | 'UI_VISIBILITY'
  | 'ASSERTION_FAILURE'
  | 'SOFT_ASSERTION_FAILURE'
  | 'NETWORK_FAILURE'
  | 'BACKEND_5XX'
  | 'AUTH_OAUTH_FAILURE'
  | 'TAB_WINDOW_ISSUE'
  | 'DATA_ISSUE'
  | 'ENVIRONMENT_ISSUE'
  | 'FLAKY'
  | 'UNKNOWN';

export interface CategorizeResult {
  category: FailureCategory;
  subtype?: string;
  confidence: number; // 0-100
  explanation?: string;
  suggestedAction?: string;
  rawMessage?: string;
}

/**
 * FailureCategorizer
 * - Lightweight heuristic engine to classify test failures.
 * - Designed to run fast in CI, produce an RCA tag and explanation,
 *   and write a small rca.json to the evidence directory.
 *
 * Improve incrementally:
 * - add more regexes
 * - add trace/network heuristics
 * - use ML/NLP model later
 */
export class FailureCategorizer {
  static logger: Logger | undefined = (globalThis as any).__TEST_LOGGER__;

  // Main entry point
  static async categorize(
    error: any,
    testInfo?: TestInfo,
    evidenceDir?: string
  ): Promise<CategorizeResult> {
    const message = FailureCategorizer.normalizeMessage(error);
    const stack = FailureCategorizer.extractStack(error);
    const combined = `${message}\n${stack}`.toLowerCase();

    // Scoreboard
    const scores: Map<FailureCategory, number> = new Map();

    // Helper to bump scores
    const bump = (cat: FailureCategory, pts: number) =>
      scores.set(cat, (scores.get(cat) ?? 0) + pts);

    // 1) Detect soft-assert failure messages (your soft assert prefix)
    if (/soft assert failed|soft assert/i.test(message)) {
      bump('SOFT_ASSERTION_FAILURE', 80);
      bump('ASSERTION_FAILURE', 20);
    }

    // 2) Assertion failures (typical thrown AssertionError)
    if (/expected .* to (equal|be|contain|have|match)|assert(?:ion)? failed|should:/i.test(message)) {
      bump('ASSERTION_FAILURE', 80);
    }

    // 3) Locator / element not found
    if (/no node found|locator|element|timeout.*waiting|waiting for selector/i.test(message)) {
      bump('UI_ELEMENT_NOT_FOUND', 80);
      bump('UI_TIMEOUT', 30);
    }

    // 4) Visibility / not visible
    if (/(not visible|not attached to the DOM|hidden)/i.test(message)) {
      bump('UI_VISIBILITY', 80);
    }

    // 5) Timeouts
    if (/timeout|timed out|wait.*timeout|exceeded 0ms timeout/i.test(message)) {
      bump('UI_TIMEOUT', 80);
      // Might be flaky or env - give some weight to FLAKY
      bump('FLAKY', 20);
    }

    // 6) Network / fetch / ECONN / socket
    if (/econnreset|econnrefused|socket hang up|fetch failed|network error|xhr failed|failed to fetch/i.test(message)) {
      bump('NETWORK_FAILURE', 80);
    }

    // 7) API returned 5xx
    if (/\b(500|502|503|504)\b/.test(message) || /http\/1\.1 5\d\d/i.test(message)) {
      bump('BACKEND_5XX', 90);
    }

    // 8) Auth / OAuth / SSO failures (common in portal popups)
    if (/oauth|sso|authentication failed|invalid credentials|unauthorized|401|403/i.test(message)) {
      bump('AUTH_OAUTH_FAILURE', 80);
    }

    // 9) Tab/window issues (your framework prefixes/messages)
    if (/tab|popup|new window|page\.waitForEvent\('page'\)|no such window/i.test(message)) {
      bump('TAB_WINDOW_ISSUE', 80);
    }

    // 10) Data issues — e.g., missing data, 404 when test expects object
    if (/not found|404|no such user|data.*missing|null reference|undefined is not/i.test(message)) {
      bump('DATA_ISSUE', 75);
    }

    // 11) Environment errors (DB connection, env var missing)
    if (/database|db connection|could not connect|env missing|connection refused/i.test(message)) {
      bump('ENVIRONMENT_ISSUE', 90);
    }

    // 12) Heuristic: many retries, intermittent stack traces -> flaky
    if (/retry.*attempt|temporarily unavailable|intermittent|flaky/i.test(message)) {
      bump('FLAKY', 80);
    }

    // 13) If nothing matched strongly, mark UNKNOWN with low confidence
    // also allow composite scoring below

    // Convert map to sorted array
    const arr = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);

    // Determine top category and compute normalized confidence
    let chosen: FailureCategory = 'UNKNOWN';
    let topScore = 0;
    if (arr.length > 0) {
      [chosen, topScore] = arr[0];
    }

    // Confidence normalization: topScore might be >100 because of bumps; clamp
    const rawConfidence = Math.min(100, topScore);
    const confidence = rawConfidence;

    // Prepare explanation based on chosen category
    const explanation = FailureCategorizer.explanationFor(chosen, message, stack);

    // Suggested action hints
    const suggestedAction = FailureCategorizer.suggestActionFor(chosen);

    const result: CategorizeResult = {
      category: chosen,
      confidence,
      explanation,
      suggestedAction,
      rawMessage: message,
      subtype: undefined,
    };

    // Write result to evidenceDir/rca.json if provided
    if (evidenceDir) {
      try {
        const outPath = path.join(evidenceDir, 'meta', 'rca.json');
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');
        FailureCategorizer.logger?.info('[FailureCategorizer] RCA written', { path: outPath, result });
      } catch (err) {
        FailureCategorizer.logger?.warn('[FailureCategorizer] Failed writing RCA', { error: String(err) });
      }
    }

    return result;
  }

  // Normalize common shapes of errors into message string
  private static normalizeMessage(err: any): string {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err.message) return String(err.message);
    if (err.toString) return err.toString();
    return JSON.stringify(err);
  }

  // extract stack if present
  private static extractStack(err: any): string {
    try {
      return err?.stack ?? '';
    } catch {
      return '';
    }
  }

  private static explanationFor(cat: FailureCategory, message: string, stack: string): string {
    switch (cat) {
      case 'UI_ELEMENT_NOT_FOUND':
        return 'Element locator failed; likely selector mismatch or DOM changed. Check locator, wait conditions, and page load.';
      case 'UI_TIMEOUT':
        return 'Operation timed out waiting for element or navigation. Could be slow network, heavy page, or missing waits.';
      case 'UI_VISIBILITY':
        return 'Element exists but is not visible (may be hidden, off-screen, or obstructed).';
      case 'ASSERTION_FAILURE':
        return 'Hard assertion failed; test expectation does not match application state.';
      case 'SOFT_ASSERTION_FAILURE':
        return 'Soft assertion(s) failed; test continued. Check assertions and data.';
      case 'NETWORK_FAILURE':
        return 'Network request failed (connection, DNS, or remote service).';
      case 'BACKEND_5XX':
        return 'Server returned 5xx error. Backend issue likely.';
      case 'AUTH_OAUTH_FAILURE':
        return 'Authentication or OAuth flow failed. Could be credentials, SSO, or third-party outage.';
      case 'TAB_WINDOW_ISSUE':
        return 'Failure related to tabs or popups (window closed, not found, or timing issues).';
      case 'DATA_ISSUE':
        return 'Test data missing or unexpected (404 or null). Validate test data setup.';
      case 'ENVIRONMENT_ISSUE':
        return 'Environment problem (DB, services down, env vars misconfigured).';
      case 'FLAKY':
        return 'Intermittent or flaky failure; may pass on retry. Consider increasing stability or investigating infra.';
      default:
        return 'Unknown failure type; requires manual analysis.';
    }
  }

  private static suggestActionFor(cat: FailureCategory): string {
    switch (cat) {
      case 'UI_ELEMENT_NOT_FOUND':
        return 'Verify selector, use role/text-based locators, increase stability wait, or update page object.';
      case 'UI_TIMEOUT':
        return 'Check network/CPU of environment; add targeted waits or increase timeout for this step.';
      case 'UI_VISIBILITY':
        return 'Ensure element is visible or not obscured. Consider scrolling, waitForVisible, or check z-index overlays.';
      case 'ASSERTION_FAILURE':
        return 'Validate expected data; check test data factory and assertions.';
      case 'SOFT_ASSERTION_FAILURE':
        return 'Review soft assertions in test; convert important ones to hard asserts if necessary.';
      case 'NETWORK_FAILURE':
        return 'Check network logs, intercept failures, or retry policy; consider marking as environment-related.';
      case 'BACKEND_5XX':
        return 'Investigate backend logs and server status; report to backend team.';
      case 'AUTH_OAUTH_FAILURE':
        return 'Verify credentials, token validity, and 3rd-party service status.';
      case 'TAB_WINDOW_ISSUE':
        return 'Ensure tab manager is switching correctly; add waits for new window; validate pop-up flows.';
      case 'DATA_ISSUE':
        return 'Confirm test data existence and API responses; re-run data factory to regenerate data.';
      case 'ENVIRONMENT_ISSUE':
        return 'Check environment health (DB, services, infra) and restart services if needed.';
      case 'FLAKY':
        return 'Collect additional traces, increase stability, and mark test for stabilization effort.';
      default:
        return 'Manual investigation required.';
    }
  }
}
