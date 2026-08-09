import type { NextAuthConfig } from 'next-auth';

// NextAuth config that does not rely on Node.js APIs (e.g. bcrypt/Prisma)
// This is required for the edge-compatible Next.js middleware.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Strict protection for these routes and their sub-routes
      const isProtected = 
        nextUrl.pathname.startsWith('/dashboard') || 
        nextUrl.pathname.startsWith('/api/seller') ||
        nextUrl.pathname.startsWith('/checkout');

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect from login/register to dashboard if already logged in
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        // Pass role and other custom fields to the token from the authorize callback
        token.role = user.role;
        token.id = user.id;
        token.verifiedStatus = user.verifiedStatus;
      }
      return token;
    },
    session({ session, token }) {
      // Pass token fields back to the session object for client-side/server-side consumption
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.verifiedStatus = token.verifiedStatus as boolean;
      }
      return session;
    },
  },
  providers: [], // Providers are configured in auth.ts to avoid Node edge-runtime issues
} satisfies NextAuthConfig;
