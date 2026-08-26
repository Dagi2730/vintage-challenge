import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { findMemoryUser, hasDbConfiguration } from '@/lib/account-store';

// Admin bootstrap credentials come from environment (seeded into DB by prisma/seed.ts).
// The fallback below only exists so the platform is reachable before the first seed run.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@merkato.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // Check DB first if DB is configured
        if (hasDbConfiguration()) {
          try {
            const dbUser = await prisma.user.findUnique({ where: { email } });
            if (dbUser && dbUser.passwordHash) {
              const matches = await bcrypt.compare(password, dbUser.passwordHash);
              if (matches) {
                return {
                  id: dbUser.id,
                  name: dbUser.name,
                  email: dbUser.email,
                  role: dbUser.role,
                  verifiedStatus: dbUser.verifiedStatus,
                };
              }
            }
          } catch (e) {
            console.error('Error authenticating with DB:', e);
          }
        } else {
          const memoryUser = findMemoryUser(email);
          if (memoryUser && memoryUser.passwordHash) {
            const matches = await bcrypt.compare(password, memoryUser.passwordHash);
            if (matches) {
              return {
                id: memoryUser.id,
                name: memoryUser.name,
                email: memoryUser.email,
                role: memoryUser.role,
                verifiedStatus: memoryUser.verifiedStatus,
              };
            }
          }
        }

        // Admin bootstrap fallback (env-driven; DB is checked first above)
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return {
            id: 'admin_user',
            name: 'Platform Admin',
            email: ADMIN_EMAIL,
            role: 'ADMIN',
            verifiedStatus: true,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verifiedStatus = user.verifiedStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.verifiedStatus = Boolean(token.verifiedStatus);

        // Fetch fresh verified status from DB if possible
        if (hasDbConfiguration()) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { verifiedStatus: true, role: true }
            });
            if (dbUser) {
              session.user.verifiedStatus = dbUser.verifiedStatus;
              session.user.role = dbUser.role;
            }
          } catch (e) {
            console.error('Failed to fetch fresh user status:', e);
          }
        }
      }
      return session;
    },
  },
});