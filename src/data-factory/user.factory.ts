import { BaseFactory } from './base.factory';
import { ApiClient } from '@src/api/api-client';

export class UserFactory extends BaseFactory {
  private api: ApiClient;

  constructor(apiBaseUrl: string) {
    super();
    this.api = new ApiClient(apiBaseUrl, this.logger);
  }

  async authenticate(username: string, password: string) {
    await this.api.authenticate(username, password);
  }

  async createUser(role: string) {
    const username = this.unique(`user_${role}`);

    this.logger.info("UserFactory.createUser()", { username, role });

    const payload = {
      username,
      password: "Password123!",
      role
    };

    return await this.api.post('/users', payload);
  }
}
