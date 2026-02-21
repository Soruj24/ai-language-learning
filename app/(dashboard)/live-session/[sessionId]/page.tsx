import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import dynamicImport from 'next/dynamic';

const LiveSessionClient = dynamicImport(() => import('./LiveSessionClient'), {
  loading: () => <div className="flex items-center justify-center h-screen">Loading Live Session...</div>,
});

export const dynamic = 'force-dynamic';

interface LiveSessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function LiveSessionPage({ params }: LiveSessionPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const { sessionId } = await params;

  return (
    <LiveSessionClient 
      sessionId={sessionId} 
      userName={session.user.name || "Anonymous"} 
      userId={session.user.id || "unknown"}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userRole={(session.user as any).role || "student"}
    />
  );
}
