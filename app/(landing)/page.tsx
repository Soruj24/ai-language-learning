import { LandingNavbar } from "@/app/components/landing/navbar";
import { Hero } from "@/app/components/landing/hero";
import { Features } from "@/app/components/landing/features";
import { HowItWorks } from "@/app/components/landing/how-it-works";
import { Testimonials } from "@/app/components/landing/testimonials";
import { Pricing } from "@/app/components/landing/pricing";
import { Footer } from "@/app/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
