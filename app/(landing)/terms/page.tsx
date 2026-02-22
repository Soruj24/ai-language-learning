import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Footer } from "@/app/components/landing/footer";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-lg max-w-none text-gray-300">
          <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p>
            Please read these Terms of Service ("Terms") carefully before using the LinguaAI platform operated by us.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of LinguaAI and its licensors.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@lingua-ai.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
