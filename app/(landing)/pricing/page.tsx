import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Link href="/">
            <span className="gradient-text">Lingua</span>AI
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button variant="gradient">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-24 px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your learning goals. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For casual learners</CardDescription>
              <div className="text-4xl font-bold mt-4">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Daily Lessons</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Basic Vocabulary</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Community Access</li>
                <li className="flex items-center gap-3 text-muted-foreground"><Check className="h-5 w-5 text-muted" /> Pronunciation Analysis</li>
                <li className="flex items-center gap-3 text-muted-foreground"><Check className="h-5 w-5 text-muted" /> AI Tutor</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/register" className="w-full">
                <Button className="w-full" variant="outline">Start for Free</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">Most Popular</div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For serious students</CardDescription>
              <div className="text-4xl font-bold mt-4">$9<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Everything in Free</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Unlimited Hearts</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Pronunciation Analysis</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> No Ads</li>
                <li className="flex items-center gap-3 text-muted-foreground"><Check className="h-5 w-5 text-muted" /> 1-on-1 AI Tutor</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login?redirect=/billing" className="w-full">
                <Button className="w-full" variant="default">Get Pro</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>For mastery seekers</CardDescription>
              <div className="text-4xl font-bold mt-4">$19<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Everything in Pro</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> 1-on-1 AI Tutor</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Certification</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Offline Mode</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Priority Support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login?redirect=/billing" className="w-full">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0">Get Premium</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40 bg-background/80 backdrop-blur-md">
        © {new Date().getFullYear()} LinguaAI. All rights reserved.
      </footer>
    </div>
  );
}
