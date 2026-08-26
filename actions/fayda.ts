'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration, findMemoryUserById, updateMemoryUser } from '@/lib/account-store';
import { revalidatePath } from 'next/cache';
import { ensureUserExists } from '@/actions/user';

// In-memory sandbox store for Fayda OTPs
const otpStore = new Map<string, { code: string; expiresAt: number; fanNumber: string; verifiedOtp: boolean }>();

// Simple in-memory rate limiter for OTP requests
const otpRateLimit = new Map<string, { count: number; expiresAt: number }>();

export async function requestFaydaOtp(fanNumber: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to request verification.');
  }

  const sanitizedFan = fanNumber.replace(/\D/g, '');
  if (sanitizedFan.length < 10) {
    throw new Error('Please enter a valid 12 to 16 digit Fayda Identification Number (FAN).');
  }

  const now = Date.now();
  const attempt = otpRateLimit.get(session.user.id);
  if (attempt && attempt.expiresAt > now) {
    if (attempt.count >= 3) {
      throw new Error('Too many OTP requests. Please wait before trying again.');
    }
    attempt.count++;
  } else {
    otpRateLimit.set(session.user.id, { count: 1, expiresAt: now + 60 * 1000 }); // 1 minute window
  }

  const demoOtp = '849201';
  otpStore.set(session.user.id, {
    code: demoOtp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    fanNumber: sanitizedFan,
    verifiedOtp: false,
  });

  return {
    success: true,
    message: 'OTP sent to the phone number registered with Fayda ID.',
    demoOtp,
    maskedPhone: '+251 91 **** 456',
  };
}

export async function verifyFaydaOtp(otpCode: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to complete verification.');
  }

  const userId = session.user.id;
  const stored = otpStore.get(userId);

  if (!stored) {
    throw new Error('No pending OTP request found. Please request a new OTP.');
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(userId);
    throw new Error('OTP has expired. Please request a new code.');
  }

  if (otpCode.trim() !== stored.code && otpCode.trim() !== '849201') {
    throw new Error('Invalid OTP code. Please check and try again.');
  }

  stored.verifiedOtp = true;
  otpStore.set(userId, stored);

  return {
    success: true,
    message: 'OTP code verified! Please upload a photo of your Fayda National ID card.',
  };
}

import {
  saveVerificationSubmission,
  updateVerificationRecordState,
} from '@/lib/verification-store';

export async function submitFaydaVerificationRequest(idPhotoUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to submit verification.');
  }

  const userId = session.user.id;
  const userName = session.user.name ?? 'User Account';
  const userEmail = session.user.email ?? 'user@example.com';
  const stored = otpStore.get(userId);

  const fanNumber = stored?.fanNumber ?? '9842104920491049';
  const photoUrl = idPhotoUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80';

  // Save to global verification store
  saveVerificationSubmission({
    userId,
    userName,
    userEmail,
    fanNumber,
    nationalIdUrl: photoUrl,
  });

  // Always update memory account store
  updateMemoryUser(userId, {
    fanNumber,
    nationalIdUrl: photoUrl,
    verificationState: 'IN_PROGRESS',
    verifiedStatus: false,
  });

  if (hasDbConfiguration()) {
    try {
      await ensureUserExists(session.user);
      await prisma.user.updateMany({
        where: { OR: [{ id: userId }, { email: userEmail }] },
        data: {
          fanNumber,
          nationalIdUrl: photoUrl,
          verificationState: 'IN_PROGRESS',
          verifiedStatus: false,
        },
      });
    } catch (error) {
      console.error('Failed to save ID verification request in DB:', error);
    }
  }

  otpStore.delete(userId);

  revalidatePath('/account');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/');

  return {
    success: true,
    message: 'Verification request submitted! Admin will review your National ID details.',
  };
}

export async function adminApproveVerification(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.');
  }

  updateVerificationRecordState(userId, 'VERIFIED');

  updateMemoryUser(userId, {
    verificationState: 'VERIFIED',
    verifiedStatus: true,
  });

  if (hasDbConfiguration()) {
    try {
      await prisma.user.updateMany({
        where: { OR: [{ id: userId }, { email: userId }] },
        data: {
          verificationState: 'VERIFIED',
          verifiedStatus: true,
        },
      });
    } catch (error) {
      console.error('Failed to approve verification in DB:', error);
    }
  }

  revalidatePath('/account');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}

export async function adminDeclineVerification(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.');
  }

  updateVerificationRecordState(userId, 'DECLINED');

  updateMemoryUser(userId, {
    verificationState: 'DECLINED',
    verifiedStatus: false,
  });

  if (hasDbConfiguration()) {
    try {
      await prisma.user.updateMany({
        where: { OR: [{ id: userId }, { email: userId }] },
        data: {
          verificationState: 'DECLINED',
          verifiedStatus: false,
        },
      });
    } catch (error) {
      console.error('Failed to decline verification in DB:', error);
    }
  }

  revalidatePath('/account');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}
