import { auth } from "@/app/lib/auth";
import type { Session } from "next-auth";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch (err) {
    console.error("[dashboard][auth] failed to read session:", err);
    session = null;
  }

  return <DashboardClient userName={session?.user?.name || 'Student'} />;
}
