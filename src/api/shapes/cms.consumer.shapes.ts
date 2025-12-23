export interface ApiConsumerCreateRequest {
  name: string;
  description?: string;
}

export interface ApiKeyRecord {
  key: string;
  createdAt: string;
}

export interface ApiConsumerRecord {
  id: string;
  name: string;
  active: boolean;
  keys: ApiKeyRecord[];
}

export interface ApiConsumerCreateResponse {
  id: string;
  apiKey: string;
}
