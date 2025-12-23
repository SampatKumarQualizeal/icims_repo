export interface HaEventRecord {
  id: string;
  type: string;
  status: string;
  timestamp: string;
  payload?: any;
}

export interface HaEventListResponse {
  items: HaEventRecord[];
  total: number;
}
