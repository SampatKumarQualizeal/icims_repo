import { TestMetadata } from './types';

export function generateMetadata(overrides: Partial<TestMetadata>): TestMetadata {
  const defaults: TestMetadata = {
    product: 'OTHER',
    owner: 'automation',
    criticalWorkflow: false,
    type: 'E2E',
    risk: 'Medium',
    tags: [],
  };

  return { ...defaults, ...overrides };
}
