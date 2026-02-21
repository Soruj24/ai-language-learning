import { auth } from "@/app/lib/auth";
import Subscription from "@/app/lib/models/Subscription";
import connectDB from "./db";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  // Admin bypass
  if (session.user.email === 'sorujmahmudb2h@gmail.com') {
    return true;
  }

  await connectDB();

  const subscription = await Subscription.findOne({
    userId: session.user.id,
  });

  if (!subscription) {
    return false;
  }

  const isValid =
    subscription.stripePriceId &&
    subscription.stripeCurrentPeriodEnd &&
    subscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  return !!isValid;
};

export const getSubscription = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Admin bypass
  if (session.user.email === 'sorujmahmudb2h@gmail.com') {
    return {
      plan: 'premium',
      status: 'active',
      stripeSubscriptionId: 'admin_subscription_id',
      stripeCustomerId: 'admin_customer_id',
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
      stripeCurrentPeriodEnd: new Date(Date.now() + 86400000 * 365 * 10), // 10 years
      userId: session.user.id,
    };
  }

  await connectDB();

  const subscription = await Subscription.findOne({
    userId: session.user.id,
  });

  return subscription;
};
