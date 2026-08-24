'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration, findMemoryUserById, updateMemoryUser } from '@/lib/account-store';
import { revalidatePath } from 'next/cache';

export async function getUserProfile(userId: string) {
  if (!hasDbConfiguration()) {
    const memoryUser = findMemoryUserById(userId);
    return {
      id: userId,
      name: memoryUser?.name ?? 'User',
      email: memoryUser?.email ?? 'user@example.com',
      phoneNumber: memoryUser?.phoneNumber ?? '+251 91 123 4567',
      telegramHandle: memoryUser?.telegramHandle ?? '@user',
      verifiedStatus: memoryUser?.verifiedStatus ?? false,
      nationalIdUrl: memoryUser?.nationalIdUrl ?? null,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        verifiedStatus: true,
        nationalIdUrl: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      phoneNumber: '+251 91 123 4567',
      telegramHandle: '@' + (user.name.toLowerCase().replace(/\s+/g, '')),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
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

  if (!hasDbConfiguration()) {
    updateMemoryUser(userId, {
      name: input.name,
      phoneNumber: input.phoneNumber,
      telegramHandle: input.telegramHandle,
    });

    revalidatePath('/account');
    return { success: true };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
      },
    });

    revalidatePath('/account');
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile.');
  }
}
