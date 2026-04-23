
export interface DataRecord {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  value: number;
  lastUpdated: string;
  description: string;
}

export interface ConnectionConfig {
  dbUri: string;
  collection: string;
  connected: boolean;
}
