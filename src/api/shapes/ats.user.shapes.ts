import { AuditMetadata } from "./shared.common.shapes";

export interface UserCreateRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface UserRecord extends AuditMetadata {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
}

export interface UserCreateResponse {
  id: string;
}
