import { AuditMetadata } from "./shared.common.shapes";

export interface CandidateCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeContent?: string; // Base64 resume
}

export interface CandidateRecord extends AuditMetadata {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "New" | "Active" | "Hired" | "Rejected";
}

export interface CandidateCreateResponse {
  id: string;
  created: boolean;
}

export interface CandidateSearchResponse {
  items: CandidateRecord[];
}
