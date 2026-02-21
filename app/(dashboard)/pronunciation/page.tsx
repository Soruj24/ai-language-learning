import { auth } from "@/app/lib/auth";
import { checkSubscription } from "@/app/lib/subscription";
import PronunciationClient from "./PronunciationClient";

export const dynamic = 'force-dynamic';

export default async function PronunciationPage() {
  const isPro = await checkSubscription();
  return <PronunciationClient isPro={isPro} />;
}
