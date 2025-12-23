import { poll } from './poller';
import { config } from '@config/config';
import { Logger } from '@src/utils/logger.util';

type MailMatchOpts = {
  to?: string;                // exact or substring on recipient
  subjectRegex?: RegExp;
  bodyRegex?: RegExp;
  deleteAfterMatch?: boolean; // optionally delete message after matching
};

const logger: Logger | undefined = (globalThis as any).__TEST_LOGGER__;

async function fetchMailhogMessages(mailhogBaseUrl: string) {
  // MailHog v2 API: GET /api/v2/messages
  const url = mailhogBaseUrl.endsWith('/') ? `${mailhogBaseUrl}api/v2/messages` : `${mailhogBaseUrl}/api/v2/messages`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Mail fetch failed ${resp.status}`);
  return await resp.json();
}

export async function waitForEmailMatch(opts: MailMatchOpts, pollOpts?: { intervalMs?: number; timeoutMs?: number }) {
  const mailhogUrl = config.mailhogUrl;
  if (!mailhogUrl) throw new Error('mailhogUrl not configured in secrets');

  logger?.info('waitForEmailMatch started', { opts, mailhogUrl });

  const res = await poll(async () => {
    const json = await fetchMailhogMessages(mailhogUrl);
    const messages = json?.items ?? [];

    for (const msg of messages) {
      try {
        const recipients = (msg?.To ?? []).join(', ');
        const subject = msg?.Content?.Headers?.Subject?.[0] ?? '';
        const body = msg?.Content?.Body ?? '';

        let ok = true;
        if (opts.to && !recipients.includes(opts.to)) ok = false;
        if (opts.subjectRegex && !opts.subjectRegex.test(subject)) ok = false;
        if (opts.bodyRegex && !opts.bodyRegex.test(body)) ok = false;

        if (ok) {
          logger?.info('waitForEmailMatch found message', { id: msg.ID, subject, recipients });
          // optionally delete message (MailHog API DELETE /api/v1/messages/<id>)
          if (opts.deleteAfterMatch) {
            try {
              const delUrl = mailhogUrl.endsWith('/') ? `${mailhogUrl}api/v1/messages/${msg.ID}` : `${mailhogUrl}/api/v1/messages/${msg.ID}`;
              await fetch(delUrl, { method: 'DELETE' });
              logger?.info('Deleted MailHog message', { id: msg.ID });
            } catch (e) { logger?.warn('Failed deleting message', { error: String(e) }); }
          }
          return { id: msg.ID, subject, recipients, body };
        }
      } catch (e) {
        // ignore malformed message and continue
        logger?.warn('Error checking mail message', e);
      }
    }
    return null;
  }, { intervalMs: pollOpts?.intervalMs, timeoutMs: pollOpts?.timeoutMs, onPoll: (a)=>logger?.debug('Polling mailhog', { attempt: a }) });

  return res;
}
