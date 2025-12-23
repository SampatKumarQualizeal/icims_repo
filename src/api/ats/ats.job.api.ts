// src/api/ats/ats.job.api.ts

import { ApiClient } from '@src/api/api-client';

import {
  JobCreateRequest,
  JobCreateResponse,
  JobGetResponse,
  JobListResponse,
} from '@src/api/shapes/ats.job.shapes';
import { Logger } from '@src/utils/logger.util';

export class AtsJobApi extends ApiClient {
  constructor(baseUrl: string, logger: Logger) {
    super(baseUrl, logger);
  }

  // -----------------------------------------------------
  // CREATE JOB
  // -----------------------------------------------------
  async createJob(payload: JobCreateRequest) {
    // Ensure we are authenticated
    await this.authenticate(
      process.env.API_USER!,
      process.env.API_PASS!
    );

    const raw = await this.post('/jobs', payload);

    return raw.as<JobCreateResponse>();
  }

  // -----------------------------------------------------
  // GET JOB DETAILS
  // -----------------------------------------------------
  async getJob(jobId: string) {
    const raw = await this.get(`/jobs/${jobId}`);

    return raw.as<JobGetResponse>();
  }

  // -----------------------------------------------------
  // LIST JOBS
  // -----------------------------------------------------
  async listJobs() {
    const raw = await this.get('/jobs');

    const result = raw.as<JobListResponse>();
    return result.items; // typed items[]
  }

  // -----------------------------------------------------
  // UPDATE JOB
  // -----------------------------------------------------
  async updateJob(jobId: string, payload: Partial<JobCreateRequest>) {
    const raw = await this.patch(`/jobs/${jobId}`, payload);

    return raw.as<JobCreateResponse>();
  }

  // -----------------------------------------------------
  // DELETE JOB
  // -----------------------------------------------------
  async deleteJob(jobId: string) {
    const raw = await this.delete(`/jobs/${jobId}`);

    return {
      ok: raw.isSuccess(),    // safe and correct
      status: raw.statusCode(), // explicitly exposed getter
    };
  }
}
