import { ListingStatus } from '@prisma/client';
import { mockListings } from '@/src/data/mockData';

const globalStatusStore: Map<string, ListingStatus> =
  (globalThis as any).__globalStatusStore || new Map();
(globalThis as any).__globalStatusStore = globalStatusStore;

export function getMemoryListingStatus(id: string, fallback: ListingStatus): ListingStatus {
  return globalStatusStore.get(id) ?? fallback;
}

export function setMemoryListingStatus(id: string, status: ListingStatus) {
  globalStatusStore.set(id, status);
  const item = mockListings.find((l) => l.id === id);
  if (item) {
    item.status = status as any;
  }
}
