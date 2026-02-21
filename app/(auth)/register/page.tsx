import { RegisterForm } from '@/app/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

      <Card className="w-full max-w-lg bg-[#111827]/70 backdrop-blur-md border border-gray-700/50 shadow-2xl relative overflow-hidden group">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
        
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <span className="text-2xl font-bold text-white">
              <span className="gradient-text">Lingua</span>AI
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-gray-400">
            Join thousands of language learners today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RegisterForm />
          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
