export interface AutomationCreateRequest {
  name: string;
  triggers: string[];
  actions: string[];
}

export interface AutomationRecord {
  id: string;
  name: string;
  active: boolean;
}

export interface AutomationCreateResponse {
  id: string;
}
