import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { findMemoryUser, hasDbConfiguration } from '@/lib/account-store';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // Special Admin Account Login
        if (email === 'admin@emerkato.com' && (password === 'admin123password' || password === 'admin123')) {
          return {
            id: 'admin_user',
            name: 'Platform Admin',
            email: 'admin@emerkato.com',
            role: 'ADMIN',
            verifiedStatus: true,
          };
        }

        if (!hasDbConfiguration()) {
          const user = findMemoryUser(email);
          if (!user || !user.passwordHash) return null;

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordsMatch) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            verifiedStatus: user.verifiedStatus,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordsMatch) return user;
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
      }
      return session;
    },
  },
});