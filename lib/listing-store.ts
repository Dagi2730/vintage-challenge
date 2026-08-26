import { ListingStatus } from '@prisma/client';
import { mockListings } from '@/src/data/mockData';
import type { Listing } from '@/src/types';

const globalStatusStore: Map<string, ListingStatus> =
  (globalThis as any).__globalStatusStore || new Map();
(globalThis as any).__globalStatusStore = globalStatusStore;

const globalListingsStore: Map<string, any> =
  (globalThis as any).__globalListingsStore || new Map();
(globalThis as any).__globalListingsStore = globalListingsStore;

const deletedMemoryIdsStore: Set<string> =
  (globalThis as any).__deletedMemoryIdsStore || new Set();
(globalThis as any).__deletedMemoryIdsStore = deletedMemoryIdsStore;

export function getMemoryListingStatus(id: string, fallback: ListingStatus): ListingStatus {
  return globalStatusStore.get(id) ?? fallback;
}

export function setMemoryListingStatus(id: string, status: ListingStatus) {
  globalStatusStore.set(id, status);
  const item = globalListingsStore.get(id) || mockListings.find((l) => l.id === id);
  if (item) {
    item.status = status;
    globalListingsStore.set(id, item);
  }
}

export function saveMemoryListing(listing: any) {
  deletedMemoryIdsStore.delete(listing.id);
  globalListingsStore.set(listing.id, listing);
  return listing;
}

export function deleteMemoryListing(id: string) {
  globalListingsStore.delete(id);
  globalStatusStore.delete(id);
  deletedMemoryIdsStore.add(id);
}

export function getAllMemoryListings(): any[] {
  const custom = Array.from(globalListingsStore.values());
  const all = [...mockListings, ...custom];
  const unique = new Map<string, any>();
  for (const item of all) {
    if (deletedMemoryIdsStore.has(item.id)) continue;
    unique.set(item.id, {
      ...item,
      status: getMemoryListingStatus(item.id, item.status as ListingStatus),
    });
  }
  return Array.from(unique.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
