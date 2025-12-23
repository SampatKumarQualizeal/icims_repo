import { poll } from './poller';
import { config } from '@config/config';
import { Logger } from '@src/utils/logger.util';
import { ApiClient } from '@src/api/api-client';

const logger: Logger | undefined = (globalThis as any).__TEST_LOGGER__;

export type HAEventOpts = {
  ruleId?: string;
  jobId?: string;
  status?: string; // e.g., 'processed', 'completed'
  apiClient?: ApiClient; // optional: pass existing authenticated ApiClient
  // fallback to simple public endpoint polling if apiClient not provided
  eventsEndpoint?: string; // e.g., `${config.apiBaseUrl}/events`
};

export async function waitForHAEvent(opts: HAEventOpts, pollOpts?: { intervalMs?: number; timeoutMs?: number }) {
  const endpoint = opts.eventsEndpoint ?? `${config.apiBaseUrl}/events`;

  logger?.info('waitForHAEvent starting', { endpoint, ruleId: opts.ruleId, jobId: opts.jobId, status: opts.status });

  // if ApiClient provided, prefer that
  const apiClient = opts.apiClient;

  const res = await poll(async () => {
    try {
      let data: any;
      if (apiClient) {
        // consumer's ApiClient may have a helper method; use generic /events GET
        const raw = await apiClient.post('/events/query', { ruleId: opts.ruleId, jobId: opts.jobId });
        const body = raw.as<{ items: any[] }>();
        data = body.items;
      } else {
        // simple fetch
        const url = new URL(endpoint);
        if (opts.ruleId) url.searchParams.set('ruleId', opts.ruleId);
        if (opts.jobId) url.searchParams.set('jobId', opts.jobId);
        const resp = await fetch(url.toString());
        if (!resp.ok) throw new Error(`events endpoint returned ${resp.status}`);
        data = await resp.json();
      }

      const items = data?.items ?? data ?? [];
      if (!Array.isArray(items)) return null;

      for (const it of items) {
        // adjust fields according to your events API
        const matchesRule = !opts.ruleId || it.ruleId === opts.ruleId || it.rule === opts.ruleId;
        const matchesJob = !opts.jobId || it.jobId === opts.jobId;
        const matchesStatus = !opts.status || it.status === opts.status;

        if (matchesRule && matchesJob && matchesStatus) {
          logger?.info('waitForHAEvent found event', { event: it });
          return it;
        }
      }
      return null;
    } catch (e) {
      logger?.warn('waitForHAEvent poll error', String(e));
      return null;
    }
  }, { intervalMs: pollOpts?.intervalMs ?? 2000, timeoutMs: pollOpts?.timeoutMs ?? 120000, onPoll: (a)=>logger?.debug('Polling HA events', { attempt: a }) });

  return res;
}
