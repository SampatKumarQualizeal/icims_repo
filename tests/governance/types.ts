export type Product = 'ATS' | 'CRM' | 'CST' | 'TXTE' | 'CMS' | 'OTHER';

export interface TestMetadata {
  product: Product;
  testId?: string;     // ← ADD THIS
  owner?: string;
  criticalWorkflow?: boolean;
  type?: 'CW' | 'E2E' | 'Smoke' | 'API' | 'UI-lite' | 'Integration';
  risk?: 'Low' | 'Medium' | 'High';
  tags?: string[];
  jiraId?: string;
}
