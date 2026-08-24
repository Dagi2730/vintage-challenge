import { randomUUID } from 'crypto';

export type MemoryAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  phoneNumber?: string;
  telegramHandle?: string;
  nationalIdUrl?: string;
  verifiedStatus: boolean;
  rating: number;
};

const memoryUsers = new Map<string, MemoryAccount>();

export function hasDbConfiguration() {
  return Boolean(process.env.DATABASE_URL);
}

export function findMemoryUser(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  return memoryUsers.get(normalizedEmail) ?? null;
}

export function findMemoryUserById(id: string) {
  return Array.from(memoryUsers.values()).find((u) => u.id === id) ?? null;
}

export function updateMemoryUser(id: string, updates: Partial<MemoryAccount>) {
  for (const [email, user] of Array.from(memoryUsers.entries())) {
    if (user.id === id) {
      const updated = { ...user, ...updates };
      memoryUsers.set(email, updated);
      return updated;
    }
  }
  return null;
}

export function createMemoryUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const email = input.email.toLowerCase().trim();

  const existing = memoryUsers.get(email);
  if (existing) {
    return null;
  }

  const user: MemoryAccount = {
    id: randomUUID(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    role: 'USER',
    phoneNumber: '+251 91 123 4567',
    telegramHandle: '@dagmawit',
    verifiedStatus: false,
    rating: 0,
  };

  memoryUsers.set(email, user);
  return user;
}
