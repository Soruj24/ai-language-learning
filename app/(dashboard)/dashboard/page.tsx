import { auth } from "@/app/lib/auth";
import { getAnalyticsData } from "@/app/lib/analytics";
import type { Session } from "next-auth";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let session: Session | null = null;
  let stats = null;
  
  try {
    session = await auth();
    stats = await getAnalyticsData();
  } catch (err) {
    console.error("[dashboard][auth] failed to read session or stats:", err);
    session = null;
  }

  return (
    <DashboardClient 
      userName={session?.user?.name || 'Student'} 
      stats={stats}
    />
  );
}
