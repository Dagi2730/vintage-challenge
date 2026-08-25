import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/sell');

      if (isOnAdmin) {
        if (isLoggedIn && role === 'ADMIN') return true;
        return false; // Denies access and redirects unauthenticated & non-admin users to /login
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig;