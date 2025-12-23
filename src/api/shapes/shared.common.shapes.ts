/**
 * Generic API shape: pagination info
 */
export interface Pagination {
  total: number;
  count: number;
  offset: number;
  limit: number;
}

/**
 * List wrapper used by many endpoints
 */
export interface ListResponse<T> {
  items: T[];
  pagination?: Pagination;
}

/**
 * Standard API response error format
 */
export interface ApiErrorShape {
  status: number;
  message: string;
  details?: any;
  timestamp?: string;
}

/**
 * Audit metadata commonly returned
 */
export interface AuditMetadata {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
