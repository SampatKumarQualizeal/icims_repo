import { ApiClient } from '@src/api/api-client';
import {
  CandidateCreateRequest,
  CandidateCreateResponse
} from '@src/api/shapes/ats.candidate.shapes';
import { Logger } from '@src/utils/logger.util';

export class CandidateFactory {

  private api: ApiClient;
  constructor(private baseUrl: string, logger:Logger) {
    this.api = new ApiClient(this.baseUrl, logger);
  }

  /**
   * Creates a candidate via API using typed models.
   */
  async createCandidate(data: Partial<CandidateCreateRequest> = {}) {
    
    await this.api.authenticate(
      process.env.API_USER!,
      process.env.API_PASS!
    );

    const payload: CandidateCreateRequest = {
      firstName: data.firstName ?? 'John',
      lastName: data.lastName ?? 'Doe',
      email: data.email ?? `auto+${Date.now()}@example.com`,
      phone: data.phone,
      resumeContent: data.resumeContent
    };

    // Always await before calling .as<T>()
    const raw = await this.api.post('/candidates', payload);
    const typed = raw.as<CandidateCreateResponse>();

    return typed.id;
  }
}
