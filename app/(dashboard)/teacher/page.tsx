import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import TeacherClient from "./TeacherClient";

export default async function TeacherPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  
  if (!session?.user || (role !== 'teacher' && role !== 'admin')) {
    redirect("/dashboard");
  }

  return <TeacherClient />;
}
