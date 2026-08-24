import { VerificationState } from '@/src/types';

export type VerificationRecord = {
  userId: string;
  userName: string;
  userEmail: string;
  fanNumber: string;
  nationalIdUrl: string;
  verificationState: VerificationState;
  submittedAt: Date;
};

// Global persistence store attached to globalThis to survive Next.js HMR reloads
const globalVerificationStore: Map<string, VerificationRecord> =
  (globalThis as any).__globalVerificationStore || new Map();

(globalThis as any).__globalVerificationStore = globalVerificationStore;

// Pre-seed with default demo submission if empty
if (globalVerificationStore.size === 0) {
  globalVerificationStore.set('user_1', {
    userId: 'user_1',
    userName: 'Abebe Kebede',
    userEmail: 'abebe@example.com',
    fanNumber: '9842-1049-2049-1049',
    nationalIdUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80',
    verificationState: 'VERIFIED',
    submittedAt: new Date(),
  });
}

export function saveVerificationSubmission(record: {
  userId: string;
  userName: string;
  userEmail: string;
  fanNumber: string;
  nationalIdUrl: string;
}) {
  const existing = globalVerificationStore.get(record.userId);
  const newRecord: VerificationRecord = {
    userId: record.userId,
    userName: record.userName,
    userEmail: record.userEmail,
    fanNumber: record.fanNumber,
    nationalIdUrl: record.nationalIdUrl,
    verificationState: 'IN_PROGRESS',
    submittedAt: new Date(),
  };

  globalVerificationStore.set(record.userId, newRecord);
  return newRecord;
}

export function updateVerificationRecordState(userId: string, state: VerificationState) {
  const existing = globalVerificationStore.get(userId);
  if (existing) {
    existing.verificationState = state;
    globalVerificationStore.set(userId, existing);
    return existing;
  }
  return null;
}

export function getVerificationRecord(userId: string): VerificationRecord | null {
  return globalVerificationStore.get(userId) ?? null;
}

export function getAllVerificationRecords(): VerificationRecord[] {
  return Array.from(globalVerificationStore.values()).sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
  );
}
