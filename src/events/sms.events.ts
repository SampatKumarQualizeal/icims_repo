import { poll } from './poller';
import { config } from '@config/config';
import { Logger } from '@src/utils/logger.util';

const logger: Logger | undefined = (globalThis as any).__TEST_LOGGER__;

export async function waitForSmsMatch(opts: { to?: string; bodyRegex?: RegExp; from?: string }, pollOpts?: { intervalMs?: number; timeoutMs?: number }) {
  const twilioUrl = config.secrets.twilioUrl; // your test/MOCK endpoint
  if (!twilioUrl) throw new Error('twilioUrl not configured in secrets');

  logger?.info('waitForSmsMatch starting', { twilioUrl, opts });

  const res = await poll(async () => {
    const url = twilioUrl.endsWith('/') ? `${twilioUrl}messages` : `${twilioUrl}/messages`;
    const resp = await fetch(url);
    if (!resp.ok) {
      logger?.warn('twilio/messages fetch failed', { status: resp.status });
      return null;
    }
    const json = await resp.json();
    const items = json?.messages ?? json ?? [];

    for (const m of items) {
      const to = m.to ?? m.toNumber ?? m.toPhone ?? '';
      const body = m.body ?? m.message ?? '';
      const from = m.from ?? m.fromNumber ?? '';

      let ok = true;
      if (opts.to && !to.includes(opts.to)) ok = false;
      if (opts.from && !from.includes(opts.from)) ok = false;
      if (opts.bodyRegex && !opts.bodyRegex.test(body)) ok = false;

      if (ok) {
        logger?.info('waitForSmsMatch found message', { id: m.id ?? m.sid, to, from, body });
        return { id: m.id ?? m.sid, to, from, body };
      }
    }
    return null;
  }, { intervalMs: pollOpts?.intervalMs ?? 2000, timeoutMs: pollOpts?.timeoutMs ?? 120000, onPoll: (a)=>logger?.debug('Polling sms messages', { attempt: a }) });

  return res;
}
