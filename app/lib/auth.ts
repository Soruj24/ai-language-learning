import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import connectDB from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          await connectDB();
          const user = await User.findOne({ email });
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      if (token.role && session.user) {
        (session.user as any).role = token.role as string;
      }

      if (token.languageLearning && session.user) {
        (session.user as any).languageLearning = token.languageLearning as string;
      }
      
      if (token.interfaceLanguage && session.user) {
        (session.user as any).interfaceLanguage = token.interfaceLanguage as string;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      await connectDB();
      const existingUser = await User.findById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.languageLearning = existingUser.languageLearning;
      token.interfaceLanguage = existingUser.interfaceLanguage;
      return token;
    },
  }
});
