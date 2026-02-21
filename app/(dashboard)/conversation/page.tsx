import { auth } from "@/app/lib/auth";
import { getSubscription } from "@/app/lib/subscription";
import ConversationClient from "./ConversationClient";

export const dynamic = 'force-dynamic';

export default async function ConversationPage() {
  const subscription = await getSubscription();
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
  return <ConversationClient isPremium={isPremium} />;
}
