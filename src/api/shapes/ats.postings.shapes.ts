export interface PortalPostRequest {
  portalId: string;
  jobId: string;
}

export interface PortalPostResponse {
  postingId: string;
  success: boolean;
  portalName?: string;
}

export interface PortalCancelRequest {
  postingId: string;
}

export interface PortalCancelResponse {
  success: boolean;
}
