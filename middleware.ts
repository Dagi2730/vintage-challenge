import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Initialize NextAuth with the edge-compatible configuration
export const { auth: middleware } = NextAuth(authConfig);

// Define the paths where the middleware should run
export const config = {
  // Matcher ignores next/image, next/static, API routes not explicitly protected, and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
