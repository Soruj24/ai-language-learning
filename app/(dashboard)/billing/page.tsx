import { auth } from "@/app/lib/auth";
import { getSubscription } from "@/app/lib/subscription";
import BillingClient from "./BillingClient";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const subscription = await getSubscription();

  // Serializing subscription data for client component
  const subscriptionData = subscription ? {
    plan: subscription.plan,
    status: subscription.status,
    stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd?.toISOString(),
  } : null;

  return <BillingClient subscription={subscriptionData} />;
}
