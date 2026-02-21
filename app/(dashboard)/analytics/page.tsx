import { getAnalyticsData } from "@/app/lib/analytics";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import dynamicImport from 'next/dynamic';

const AnalyticsClient = dynamicImport(() => import('./AnalyticsClient'), {
  loading: () => <div className="p-8 text-center">Loading analytics...</div>,
});

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  // Restrict to Admin only
  if (!session?.user || role !== 'admin') {
    redirect("/dashboard");
  }

  const stats = await getAnalyticsData();
  
  return <AnalyticsClient initialStats={stats} />;
}
