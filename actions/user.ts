'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { hasDbConfiguration, findMemoryUserById, updateMemoryUser } from '@/lib/account-store';
import { revalidatePath } from 'next/cache';

import { getVerificationRecord } from '@/lib/verification-store';

export async function ensureUserExists(sessionUser: { id: string; name?: string | null; email?: string | null }) {
  if (!hasDbConfiguration() || !sessionUser?.id) return;

  try {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: sessionUser.id,
          name: sessionUser.name || 'User Account',
          email: sessionUser.email || `${sessionUser.id}@emerkato.com`,
          passwordHash: 'in-memory-session-user',
          role: 'USER',
          verifiedStatus: false,
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring user exists in DB:', error);
  }
}

export async function getUserProfile(userId: string) {
  const vRecord = getVerificationRecord(userId);

  if (!hasDbConfiguration()) {
    const memoryUser = findMemoryUserById(userId);
    const vState = vRecord?.verificationState ?? memoryUser?.verificationState ?? (memoryUser?.verifiedStatus ? 'VERIFIED' : 'UNVERIFIED');
    return {
      id: userId,
      name: memoryUser?.name ?? 'User',
      email: memoryUser?.email ?? 'user@example.com',
      phoneNumber: memoryUser?.phoneNumber ?? '',
      telegramHandle: memoryUser?.telegramHandle ?? '',
      fanNumber: vRecord?.fanNumber ?? memoryUser?.fanNumber ?? null,
      nationalIdUrl: vRecord?.nationalIdUrl ?? memoryUser?.nationalIdUrl ?? null,
      verificationState: vState,
      verifiedStatus: vState === 'VERIFIED',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const memoryUser = findMemoryUserById(userId);
      const vState = vRecord?.verificationState ?? memoryUser?.verificationState ?? 'UNVERIFIED';
      return {
        id: userId,
        name: memoryUser?.name ?? 'User',
        email: memoryUser?.email ?? 'user@example.com',
        phoneNumber: memoryUser?.phoneNumber ?? '',
        telegramHandle: memoryUser?.telegramHandle ?? '',
        fanNumber: vRecord?.fanNumber ?? memoryUser?.fanNumber ?? null,
        nationalIdUrl: vRecord?.nationalIdUrl ?? memoryUser?.nationalIdUrl ?? null,
        verificationState: vState,
        verifiedStatus: vState === 'VERIFIED',
      };
    }

    const vState = (vRecord?.verificationState ?? (user as any).verificationState ?? (user.verifiedStatus ? 'VERIFIED' : 'UNVERIFIED')) as any;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber ?? '',
      telegramHandle: user.telegramHandle ?? '',
      fanNumber: vRecord?.fanNumber ?? (user as any).fanNumber ?? null,
      nationalIdUrl: vRecord?.nationalIdUrl ?? user.nationalIdUrl ?? null,
      verificationState: vState,
      verifiedStatus: vState === 'VERIFIED',
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const memoryUser = findMemoryUserById(userId);
    const vState = vRecord?.verificationState ?? memoryUser?.verificationState ?? 'UNVERIFIED';
    return {
      id: userId,
      name: memoryUser?.name ?? 'User Account',
      email: memoryUser?.email ?? 'user@example.com',
      phoneNumber: memoryUser?.phoneNumber ?? '',
      telegramHandle: memoryUser?.telegramHandle ?? '',
      fanNumber: vRecord?.fanNumber ?? null,
      nationalIdUrl: vRecord?.nationalIdUrl ?? null,
      verificationState: vState,
      verifiedStatus: vState === 'VERIFIED',
    };
  }
}

export async function updateUserProfile(input: {
  name: string;
  phoneNumber?: string;
  telegramHandle?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to update your profile.');
  }

  const userId = session.user.id;

  // Always update memory user store
  updateMemoryUser(userId, {
    name: input.name,
    phoneNumber: input.phoneNumber,
    telegramHandle: input.telegramHandle,
  });

  if (hasDbConfiguration()) {
    try {
      await ensureUserExists(session.user);
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          phoneNumber: input.phoneNumber,
          telegramHandle: input.telegramHandle,
        },
      });
    } catch (error) {
      console.error('Error updating user profile in DB:', error);
    }
  }

  revalidatePath('/account');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateAdminAccount(input: {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  const userId = session.user.id;
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  let newPasswordHash: string | undefined = undefined;

  if (input.newPassword) {
    if (input.newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters.' };
    }

    if (!input.currentPassword) {
      return { error: 'Current password is required to change password.' };
    }

    // Verify current password against DB or memory user or default fallback
    let isCurrentValid = false;
    if (hasDbConfiguration()) {
      try {
        const adminDb = await prisma.user.findUnique({ where: { id: userId } });
        if (adminDb && adminDb.passwordHash) {
          isCurrentValid = await bcrypt.compare(input.currentPassword, adminDb.passwordHash);
        } else if (input.currentPassword === 'admin123password' || input.currentPassword === 'admin123') {
          isCurrentValid = true;
        }
      } catch (e) {
        if (input.currentPassword === 'admin123password' || input.currentPassword === 'admin123') {
          isCurrentValid = true;
        }
      }
    } else {
      const memoryUser = findMemoryUserById(userId);
      if (memoryUser && memoryUser.passwordHash) {
        isCurrentValid = await bcrypt.compare(input.currentPassword, memoryUser.passwordHash);
      } else if (input.currentPassword === 'admin123password' || input.currentPassword === 'admin123') {
        isCurrentValid = true;
      }
    }

    if (!isCurrentValid) {
      return { error: 'Current password is incorrect.' };
    }

    newPasswordHash = await bcrypt.hash(input.newPassword, 10);
  }

  // Persist to Database if configured
  if (hasDbConfiguration()) {
    try {
      const updateData: any = {
        name,
        email,
        role: 'ADMIN',
      };
      if (newPasswordHash) {
        updateData.passwordHash = newPasswordHash;
      }

      const existingAdmin = await prisma.user.findUnique({ where: { id: userId } });
      if (existingAdmin) {
        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      } else {
        await prisma.user.upsert({
          where: { email },
          update: updateData,
          create: {
            id: userId,
            name,
            email,
            passwordHash: newPasswordHash || (await bcrypt.hash('admin123password', 10)),
            role: 'ADMIN',
            verifiedStatus: true,
          },
        });
      }
    } catch (error) {
      console.error('Error updating admin account in DB:', error);
      return { error: 'Failed to save admin account settings to database.' };
    }
  }

  // Also update memory account store
  const memoryUpdates: any = {
    name,
    email,
    role: 'ADMIN',
    verifiedStatus: true,
  };
  if (newPasswordHash) {
    memoryUpdates.passwordHash = newPasswordHash;
  }
  updateMemoryUser(userId, memoryUpdates);

  revalidatePath('/account');
  revalidatePath('/admin');
  return { success: true, message: 'Admin account settings updated successfully!' };
}
