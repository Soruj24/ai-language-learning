import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Footer } from "@/app/components/landing/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-gray-100">
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-white tracking-tight">
                <span className="gradient-text">Lingua</span>AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-lg max-w-none text-gray-300">
          <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p>
            At LinguaAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website and use our AI language learning platform.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you register for an account, create a profile, or communicate with us. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 mb-8">
            <li>Personal identifiers (name, email address)</li>
            <li>Learning preferences and goals</li>
            <li>Voice data (for pronunciation analysis)</li>
            <li>Progress and usage data</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 mb-8">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your learning experience</li>
            <li>Process your voice inputs for pronunciation feedback</li>
            <li>Send you technical notices and support messages</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@lingua-ai.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
