
import { DataRecord } from './types';

// Initial Mock Data
let mockRecords: DataRecord[] = [
  {
    id: '1',
    name: 'Primary Pipeline',
    type: 'ETL',
    status: 'active',
    value: 12500,
    lastUpdated: new Date().toISOString(),
    description: 'Main data synchronization pipeline for customer records.'
  },
  {
    id: '2',
    name: 'Analytical Node B',
    type: 'Processing',
    status: 'inactive',
    value: 4200,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    description: 'Batch processing node for legacy data analysis.'
  },
  {
    id: '3',
    name: 'Stream Validator',
    type: 'Validation',
    status: 'pending',
    value: 8900,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    description: 'Real-time validation engine for incoming API streams.'
  }
];

export async function getRecords(): Promise<DataRecord[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...mockRecords];
}

export async function getRecordById(id: string): Promise<DataRecord | undefined> {
  return mockRecords.find(r => r.id === id);
}

export async function upsertRecord(record: Partial<DataRecord>): Promise<DataRecord> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (record.id) {
    const index = mockRecords.findIndex(r => r.id === record.id);
    if (index !== -1) {
      mockRecords[index] = { ...mockRecords[index], ...record, lastUpdated: new Date().toISOString() };
      return mockRecords[index];
    }
  }

  const newRecord: DataRecord = {
    id: Math.random().toString(36).substr(2, 9),
    name: record.name || 'New Record',
    type: record.type || 'Generic',
    status: record.status || 'pending',
    value: record.value || 0,
    description: record.description || '',
    lastUpdated: new Date().toISOString(),
  };
  mockRecords.push(newRecord);
  return newRecord;
}

export async function deleteRecord(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockRecords = mockRecords.filter(r => r.id !== id);
}
