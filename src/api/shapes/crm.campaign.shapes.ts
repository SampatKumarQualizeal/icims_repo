import { AuditMetadata } from "./shared.common.shapes";

export interface CampaignCreateRequest {
  name: string;
  type: string;
  targetGroup: string[];
  message?: string;
}

export interface CampaignRecord extends AuditMetadata {
  id: string;
  name: string;
  status: "Active" | "Archived";
}

export interface CampaignCreateResponse {
  id: string;
  success: boolean;
}

export interface CampaignArchiveResponse {
  id: string;
  archived: boolean;
}
