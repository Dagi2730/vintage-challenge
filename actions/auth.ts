'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { createMemoryUser, findMemoryUser, hasDbConfiguration } from '@/lib/account-store';

export async function registerUser(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const rawTelegram = String(formData.get('telegramHandle') ?? '').trim();
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim();

  if (!name || !email || !password) {
    return { error: 'Please fill in all required fields.' };
  }

  const telegramHandle = rawTelegram
    ? (rawTelegram.startsWith('@') ? rawTelegram : '@' + rawTelegram)
    : '@' + name.toLowerCase().replace(/\s+/g, '');

  if (!hasDbConfiguration()) {
    const existingAccount = findMemoryUser(email);
    if (existingAccount) {
      return { error: 'Email already registered.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const memoryUser = createMemoryUser({
      name,
      email,
      passwordHash: hashedPassword,
      telegramHandle,
      phoneNumber: phoneNumber || '+251 91 123 4567',
    });

    if (!memoryUser) {
      return { error: 'Email already registered.' };
    }

    return { success: 'Account created successfully! You can now log in.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already registered.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await (prisma.user as any).create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        telegramHandle,
        phoneNumber: phoneNumber || '+251 91 123 4567',
      },
    });

    return { success: 'Account created successfully! You can now log in.' };
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return { error: 'The database is not configured. Add a valid DATABASE_URL.' };
    }

    if (error instanceof Error && error.message.toLowerCase().includes('connect')) {
      return { error: 'The database is unreachable. Check PostgreSQL credentials and connection.' };
    }

    return { error: 'Something went wrong during registration. Verify PostgreSQL is running and DATABASE_URL is valid.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return 'Please fill in both email and password.';
  }

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result && typeof result === 'object' && 'error' in result) {
      return 'Invalid credentials.';
    }

    let isAdmin = email === 'admin@emerkato.com';
    if (!isAdmin) {
      if (!hasDbConfiguration()) {
        const u = findMemoryUser(email);
        if (u?.role === 'ADMIN') isAdmin = true;
      } else {
        try {
          const u = await prisma.user.findUnique({ where: { email }, select: { role: true } });
          if (u?.role === 'ADMIN') isAdmin = true;
        } catch (e) {
          // ignore error
        }
      }
    }

    if (isAdmin) {
      redirect('/admin');
    }

    redirect('/dashboard');
  } catch (error) {
    if (
      (error instanceof Error && error.message === 'NEXT_REDIRECT') ||
      (typeof error === 'object' && error !== null && 'digest' in error && String((error as any).digest).startsWith('NEXT_REDIRECT'))
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return 'Invalid credentials.';
      }
      return 'Authentication is not configured. Set NEXTAUTH_SECRET / AUTH_SECRET.';
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('secret') || message.includes('auth_secret') || message.includes('nextauth_secret')) {
        return 'Authentication secret is missing. Add AUTH_SECRET or NEXTAUTH_SECRET.';
      }
      if (message.includes('database') || message.includes('database_url')) {
        return 'Could not sign in. Check the database and auth configuration.';
      }
    }

    console.error('Authentication error:', error);
    return 'Could not sign in. Check the database and auth configuration.';
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}