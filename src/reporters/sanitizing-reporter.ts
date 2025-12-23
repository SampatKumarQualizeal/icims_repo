// src/reporters/sanitizing-reporter.ts
import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  TestStep
} from '@playwright/test/reporter';

import {
  sanitizeString,
  sanitizeObject,
  safeJsonStringify
} from '@src/utils/sanitizer.util';

export default class SanitizingReporter implements Reporter {
  // Optional: log activation
  onBegin(_config: FullConfig, _suite: Suite) {
    console.log('[SanitizingReporter] Active – all output will be scrubbed.');
  }

  /**
   * Sanitize step titles and errors
   */
  onStepBegin(_test: TestCase, _result: TestResult, step: TestStep) {
    // Sanitize step title
    step.title = sanitizeString(step.title);
  }

  /**
   * Scrub step errors, messages, and attachments as they are recorded.
   */
  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep) {
    if (step.error) {
      step.error.message = sanitizeString(step.error.message);
      if (step.error.stack) {
        step.error.stack = sanitizeString(step.error.stack);
      }
    }

    // Sanitize step attachments
    for (const attachment of step.attachments) {
      this.sanitizeAttachment(attachment);
    }
  }

  /**
   * Clean stdout produced during test execution.
   */
  onStdOut(chunk: string | Buffer, _test: TestCase | void) {
    const text = typeof chunk === 'string' ? chunk : chunk.toString();
    return sanitizeString(text);
  }

  /**
   * Clean stderr during test execution.
   */
  onStdErr(chunk: string | Buffer, _test: TestCase | void) {
    const text = typeof chunk === 'string' ? chunk : chunk.toString();
    return sanitizeString(text);
  }

  /**
   * Sanitize test attachments
   */
  onTestEnd(_test: TestCase, result: TestResult) {
    if (result.error) {
      result.error.message = sanitizeString(result.error.message);
      if (result.error.stack) {
        result.error.stack = sanitizeString(result.error.stack);
      }
    }

    // Sanitize test attachments
    for (const attachment of result.attachments) {
      this.sanitizeAttachment(attachment);
    }

    // Sanitize annotations
    for (const ann of result.annotations) {
      ann.description = sanitizeString(ann.description ?? '');
    }
  }

  /**
   * Clean reporter-generated output at end of run.
   */
  onError(error: TestResult['error']) {
    if (error?.message) error.message = sanitizeString(error.message);
    if (error?.stack) error.stack = sanitizeString(error.stack);
  }

  /**
   * Final flush of sanitized summary (optional).
   */
  onEnd() {
    console.log('[SanitizingReporter] Completed.');
  }

  /**
   * Helper to sanitize attachments
   */
  private sanitizeAttachment(attachment: any) {
    try {
      if (attachment.contentType === 'application/json') {
        const data = JSON.parse(attachment.body.toString());
        const sanitized = safeJsonStringify(sanitizeObject(data));
        attachment.body = Buffer.from(sanitized);
      } else {
        // For non-JSON attachments, sanitize as string
        const text = attachment.body.toString() ?? '';
        attachment.body = Buffer.from(sanitizeString(text));
      }
    } catch (e) {
      // If parsing fails, leave the attachment as-is
      // console.warn('[SanitizingReporter] Failed to sanitize attachment', e);
    }
  }
}