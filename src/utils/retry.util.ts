import { getExecutionProfile } from './execution-profile.util';

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts = 3,
  initialDelay = 200,
  onRetry?: (err: any, attempt: number) => void
): Promise<T> {
  const profile = getExecutionProfile();
  const isDebugMode = profile.mode === 'DEBUG';
  
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      if (i > 0 && isDebugMode) {
        console.log(`[Retry] Attempt ${i + 1}/${attempts}`);
      }
      return await fn();
    } catch (err) {
      lastErr = err;
      if (onRetry) onRetry(err, i + 1);
      
      // Don't delay after the last attempt
      if (i < attempts - 1) {
        const delay = initialDelay * Math.pow(2, i) + Math.floor(Math.random() * 50);
        if (isDebugMode) {
          console.log(`[Retry] Attempt ${i + 1} failed, waiting ${delay}ms before retry...`);
        }
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  throw lastErr;
}
