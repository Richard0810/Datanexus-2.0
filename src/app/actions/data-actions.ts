
'use server';

import { getRecords, upsertRecord, deleteRecord } from '@/lib/datanexus/mock-db';
import { DataRecord } from '@/lib/datanexus/types';
import { revalidatePath } from 'next/cache';

export async function fetchAllRecords() {
  return await getRecords();
}

export async function saveRecord(data: Partial<DataRecord>) {
  const result = await upsertRecord(data);
  revalidatePath('/');
  return result;
}

export async function removeRecord(id: string) {
  await deleteRecord(id);
  revalidatePath('/');
}
