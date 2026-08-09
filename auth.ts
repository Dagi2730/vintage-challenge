import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from './lib/prisma';
import { authConfig } from './auth.config';

// Define the validation schema for the incoming credentials
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Validate the input fields
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        
        if (!parsedCredentials.success) {
          console.error("Invalid credentials format:", parsedCredentials.error);
          return null;
        }
        
        const { email, password } = parsedCredentials.data;
        
        // 2. Query the database for the user via Prisma
        const user = await prisma.user.findUnique({
          where: { email }
        });
        
        if (!user) {
          console.error("User not found.");
          return null;
        }
        
        // 3. Verify the password hash
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordsMatch) {
          console.error("Password mismatch.");
          return null;
        }
        
        // 4. Return the user object (mapped to NextAuth User format)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verifiedStatus: user.verifiedStatus,
        };
      }
    })
  ],
  session: {
    strategy: "jwt" // Explicitly use JWT cookies for standard stateless auth
  }
});
