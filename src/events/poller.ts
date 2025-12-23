export type PollOptions = {
  intervalMs?: number; // ms between polls
  timeoutMs?: number;  // total timeout
  onPoll?: (attempt: number) => void;
};

export async function poll<T>(
  conditionFn: () => Promise<T | null | undefined | false>,
  opts?: PollOptions
): Promise<T> {
  const intervalMs = opts?.intervalMs ?? 2000;
  const timeoutMs = opts?.timeoutMs ?? 120000; // default 2min
  const start = Date.now();
  let attempt = 0;

  while (true) {
    attempt++;
    const res = await conditionFn();
    if (res) return res as T;

    if (opts?.onPoll) {
      try { opts.onPoll(attempt); } catch { /* swallow */ }
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(`poll: timeout after ${timeoutMs}ms, attempts=${attempt}`);
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }
}
