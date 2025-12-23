import { Logger } from '@src/utils/logger.util';
import { BaseFactory } from './base.factory';
import { ApiClient } from '@src/api/api-client';

export interface JobInput {
  title?: string;
  location?: string;
  recruiterId?: string;
}

export class JobFactory extends BaseFactory {
  private api: ApiClient;

  constructor(apiBaseUrl: string, logger:Logger) {
    super();
    this.api = new ApiClient(apiBaseUrl, logger);
  }

  async authenticate(username: string, password: string) {
    await this.api.authenticate(username, password);
  }

  async create(input: JobInput = {}) {
    const title = input.title ?? this.unique("Job");

    this.logger.info("JobFactory.create()", { title });

    const payload = {
      title,
      location: input.location ?? "NYC",
      recruiterId: input.recruiterId ?? "default-recruiter"
    };

    const result = await this.api.post('/jobs', payload);
    return result;
  }
}
