import { randomUUID } from 'crypto';

export type MemoryAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  phoneNumber?: string;
  telegramHandle?: string;
  fanNumber?: string;
  nationalIdUrl?: string;
  verificationState?: 'UNVERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'DECLINED';
  verifiedStatus: boolean;
  rating: number;
};

const memoryUsers = new Map<string, MemoryAccount>();

export function hasDbConfiguration() {
  return process.env.DEMO_MODE !== 'true';
}

export function findMemoryUser(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  return memoryUsers.get(normalizedEmail) ?? null;
}

export function findMemoryUserById(id: string) {
  return Array.from(memoryUsers.values()).find((u) => u.id === id) ?? null;
}

export function getAllMemoryUsers() {
  return Array.from(memoryUsers.values());
}

export function updateMemoryUser(id: string, updates: Partial<MemoryAccount>) {
  for (const [email, user] of Array.from(memoryUsers.entries())) {
    if (user.id === id) {
      const updated = { ...user, ...updates };
      memoryUsers.set(email, updated);
      return updated;
    }
  }

  // If user wasn't found by id, upsert as new memory user
  const newUser: MemoryAccount = {
    id,
    name: updates.name ?? 'User Account',
    email: updates.email ?? 'user@example.com',
    passwordHash: '',
    role: 'USER',
    phoneNumber: updates.phoneNumber ?? '+251 91 123 4567',
    telegramHandle: updates.telegramHandle ?? '@user',
    verifiedStatus: updates.verifiedStatus ?? false,
    verificationState: updates.verificationState ?? (updates.verifiedStatus ? 'VERIFIED' : 'UNVERIFIED'),
    rating: 0,
    ...updates,
  };
  memoryUsers.set(newUser.email, newUser);
  return newUser;
}

export function createMemoryUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  telegramHandle?: string;
}) {
  const email = input.email.toLowerCase().trim();

  const existing = memoryUsers.get(email);
  if (existing) {
    return null;
  }

  const rawTelegram = (input.telegramHandle ?? '').trim();
  const formattedTelegram = rawTelegram
    ? (rawTelegram.startsWith('@') ? rawTelegram : '@' + rawTelegram)
    : '@' + input.name.toLowerCase().replace(/\s+/g, '');

  const user: MemoryAccount = {
    id: randomUUID(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    role: 'USER',
    phoneNumber: input.phoneNumber?.trim() || '+251 91 123 4567',
    telegramHandle: formattedTelegram,
    verifiedStatus: false,
    rating: 0,
  };

  memoryUsers.set(email, user);
  return user;
}
