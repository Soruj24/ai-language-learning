import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import TeacherClient from "./TeacherClient";

export default async function TeacherPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  
  if (!session?.user || (role !== 'teacher' && role !== 'admin')) {
    redirect("/dashboard");
  }

  return <TeacherClient />;
}
