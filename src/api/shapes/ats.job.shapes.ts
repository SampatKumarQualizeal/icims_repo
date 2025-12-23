// src/api/shapes/ats.job.shapes.ts

// ----------------------------------------------------------------------------
// REQUEST SHAPES
// ----------------------------------------------------------------------------

export interface JobCreateRequest {
  title: string;
  jobType: string;
  location: string;
  description?: string;
  department?: string;
  salaryRange?: string;
}

// ----------------------------------------------------------------------------
// RESPONSE SHAPES
// ----------------------------------------------------------------------------

export interface JobCreateResponse {
  id: string;
  title: string;
  jobType: string;
  location: string;
  createdAt: string;
}

export interface JobGetResponse {
  id: string;
  title: string;
  jobType: string;
  location: string;
  description?: string;
  department?: string;
  salaryRange?: string;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------------
// LIST / SEARCH RESULT SHAPES
// ----------------------------------------------------------------------------

export interface JobListItem {
  id: string;
  title: string;
  jobType: string;
}

export interface JobListResponse {
  items: JobListItem[];
  total: number;
}

/**
 * Generic Search Record returned when searching jobs.
 * This may contain extra fields compared to list items.
 */
export interface JobRecord {
  id: string;
  title: string;
  jobType: string;
  location?: string;
  department?: string;
}
