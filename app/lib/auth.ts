import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import connectDB from './db';
import User from './models/User';
import Subscription from './models/Subscription';
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
      }

      if (token.languageLearning && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).languageLearning = token.languageLearning as string;
      }
      
      if (token.interfaceLanguage && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  },
  events: {
    async signIn({ user }) {
      try {
        await connectDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = user.id || (user as any)._id;
        
        if (!userId) return;

        const existingSub = await Subscription.findOne({ userId: userId });
        
        if (!existingSub) {
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await Subscription.create({
            userId: userId,
            plan: 'premium', // Grant premium access
            status: 'active',
            stripeCurrentPeriodEnd: thirtyDaysFromNow,
            stripePriceId: 'price_trial_30_days',
            stripeSubscriptionId: `trial_sub_${userId}`,
            stripeCustomerId: `trial_cust_${userId}`,
          });
          console.log(`Created 30-day trial subscription for user ${userId}`);
        }
      } catch (error) {
        console.error("Error creating trial subscription:", error);
      }
    }
  }
});
