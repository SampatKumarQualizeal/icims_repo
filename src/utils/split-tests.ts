
import { execSync } from 'child_process';

export function listTests() {
  const out = execSync('npx playwright test --list', { encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}
