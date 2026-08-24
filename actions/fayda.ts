'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration, findMemoryUserById, updateMemoryUser } from '@/lib/account-store';
import { revalidatePath } from 'next/cache';

// In-memory sandbox store for Fayda OTPs
const otpStore = new Map<string, { code: string; expiresAt: number; fanNumber: string; verifiedOtp: boolean }>();

export async function requestFaydaOtp(fanNumber: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to request verification.');
  }

  const sanitizedFan = fanNumber.replace(/\D/g, '');
  if (sanitizedFan.length < 10) {
    throw new Error('Please enter a valid 12 to 16 digit Fayda Identification Number (FAN).');
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

  if (!hasDbConfiguration()) {
    updateMemoryUser(userId, {
      fanNumber,
      nationalIdUrl: photoUrl,
      verificationState: 'IN_PROGRESS',
      verifiedStatus: false,
    });
  } else {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          nationalIdUrl: photoUrl,
          verifiedStatus: false,
        },
      });
    } catch (error) {
      console.error('Failed to save ID verification request:', error);
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
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }

  updateVerificationRecordState(userId, 'VERIFIED');

  if (!hasDbConfiguration()) {
    updateMemoryUser(userId, {
      verificationState: 'VERIFIED',
      verifiedStatus: true,
    });
  } else {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { verifiedStatus: true },
      });
    } catch (error) {
      console.error('Failed to approve verification:', error);
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
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }

  updateVerificationRecordState(userId, 'DECLINED');

  if (!hasDbConfiguration()) {
    updateMemoryUser(userId, {
      verificationState: 'DECLINED',
      verifiedStatus: false,
    });
  } else {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { verifiedStatus: false },
      });
    } catch (error) {
      console.error('Failed to decline verification:', error);
    }
  }

  revalidatePath('/account');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}
